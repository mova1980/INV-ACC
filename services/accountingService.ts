import { GoogleGenAI, Type } from '@google/genai';
import { InventoryDocument, DocumentType, JournalEntry, AccountingRule, Warehouse } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

function createPrompt(docs: InventoryDocument[], rules: AccountingRule[], warehouses: Warehouse[]): string {
  const isBulk = docs.length > 1;
  
  const documentsSummary = docs.map(doc => {
    const docTypeFarsi = doc.type === DocumentType.Receipt ? 'رسید انبار' : 'حواله انبار';
    const totalAmount = doc.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    return `
--- سند انبار ---
نوع: ${docTypeFarsi} (${doc.warehouseName})
شماره: ${doc.id}
تاریخ: ${doc.date}
مبلغ کل: ${totalAmount.toLocaleString('fa-IR')} ریال
    `;
  }).join('');

  const activeRules = rules.filter(r => r.isActive);
  const rulesSummary = activeRules.map(rule => {
      const docTypeFarsi = rule.docType === DocumentType.Receipt ? 'رسید' : 'حواله';
      const warehouseName = warehouses.find(w => w.id === rule.warehouseId)?.name || rule.warehouseId;
      const debitCostCenters = [rule.debitCostCenters.center1, rule.debitCostCenters.center2, rule.debitCostCenters.center3].filter(Boolean).join(' - ');
      const creditCostCenters = [rule.creditCostCenters.center1, rule.creditCostCenters.center2, rule.creditCostCenters.center3].filter(Boolean).join(' - ');
      return `- برای سند ${docTypeFarsi} از ${warehouseName}:
    - بدهکار: حساب با کد '${rule.debitAccount}' (مراکز: ${debitCostCenters || 'ندارد'}).
    - بستانکار: حساب با کد '${rule.creditAccount}' (مراکز: ${creditCostCenters || 'ندارد'}).
    - شرح کلی سند: '${rule.docDescription}'.
    - شرح آرتیکل: '${rule.lineDescription}'. (این شرح را برای هر آرتیکل در سند حسابداری تولید شده استفاده کن).`
  }).join('\n');


  const mainInstruction = isBulk
    ? `بر اساس ${docs.length} سند انبار زیر، یک سند حسابداری دوبل استاندارد تجمیعی ایجاد کن.`
    : `بر اساس سند انبار زیر، یک سند حسابداری دوبل استاندارد ایجاد کن.`;
  
  return `
${mainInstruction}

**خلاصه اسناد:**
${documentsSummary}

**قوانین حسابداری فعال (شابلون):**
این قوانین اولویت بالایی دارند. لطفاً دقیقاً از آنها پیروی کن. کد حساب و نام حساب را از روی لیست استخراج کن و در خروجی فقط نام حساب را بنویس.
${rulesSummary}
- برای حواله فروش، علاوه بر ثبت بهای تمام شده، ثبت فروش را نیز با فرض 25% سود انجام بده. (حسابهای دریافتنی بدهکار، درآمد فروش بستانکار)
- در توضیحات هر آرتیکل (فیلد description)، شماره سند(های) انبار مربوطه را ذکر کن.
- برای فیلد costCenter، مقادیر مراکز هزینه را با خط تیره (-) از هم جدا کن (مثال: '101-20-50').

لطفا خروجی را فقط در فرمت JSON و مطابق با اسکیمای ارائه شده برگردان.
  `;
}

export const generateAccountingDocument = async (docs: InventoryDocument[], rules: AccountingRule[], warehouses: Warehouse[]): Promise<JournalEntry> => {
    const model = 'gemini-2.5-flash';
    const prompt = createPrompt(docs, rules, warehouses);

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        lines: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    account: { type: Type.STRING },
                                    debit: { type: Type.NUMBER },
                                    credit: { type: Type.NUMBER },
                                    description: { type: Type.STRING },
                                    costCenter: { type: Type.STRING }
                                },
                                required: ['account', 'debit', 'credit', 'description']
                            }
                        }
                    },
                    required: ['lines']
                }
            }
        });
        
        const jsonText = response.text;
        const parsedResult = JSON.parse(jsonText) as JournalEntry;
        
        if (!parsedResult.lines || !Array.isArray(parsedResult.lines)) {
            throw new Error('Invalid JSON structure received from API.');
        }
        
        return parsedResult;

    } catch (error) {
        console.error('Error generating accounting document:', error);
        throw new Error('Failed to communicate with the AI model.');
    }
};