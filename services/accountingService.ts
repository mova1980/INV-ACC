import { GoogleGenAI, Type } from '@google/genai';
import { InventoryDocument, JournalEntry, AccountingRule, Warehouse, Account, CostCenterItem, DocTypeInfo, AutoGenRuleHint } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

function createPrompt(
    docs: InventoryDocument[], 
    rules: AccountingRule[], 
    warehouses: Warehouse[],
    conversionAmount: number,
    accountingDate: string,
    accountingDescription: string
): string {
  const isBulk = docs.length > 1;
  
  const documentsSummary = docs.map(doc => {
    const remainingAmount = doc.totalAmount - doc.convertedAmount;
    return `
--- سند انبار ---
نوع: ${doc.docTypeDescription} (${doc.warehouseName})
شماره: ${doc.id}
تاریخ: ${doc.date}
مبلغ کل: ${doc.totalAmount.toLocaleString('fa-IR')}
مبلغ باقیمانده برای صدور سند: ${remainingAmount.toLocaleString('fa-IR')}
    `;
  }).join('');

  const activeRules = rules.filter(r => r.isActive);
  const rulesSummary = activeRules.map(rule => {
      const warehouseName = warehouses.find(w => w.id === rule.warehouseId)?.name || rule.warehouseId;
      
      const actionsSummary = rule.actions.map(action => {
          const type = action.transactionType === 'Debit' ? 'بدهکار' : 'بستانکار';
          const costCenters = [action.costCenters.center1, action.costCenters.center2, action.costCenters.center3].filter(Boolean).join(' - ');
          return `   - ${type}: حساب کد '${action.account}' (مراکز: ${costCenters || 'ندارد'}) با شرح ردیف '${action.lineDescription}'`;
      }).join('\n');

      return `- برای سند از نوع '${docs.find(d => d.docTypeCode === rule.docTypeCode)?.docTypeDescription || ''}' از انبار '${warehouseName}':
    شرح کلی سند: '${rule.docDescription}'
    آرتیکل ها:
${actionsSummary}
      `
  }).join('\n');

  const mainInstruction = isBulk
    ? `بر اساس ${docs.length} سند انبار زیر، یک سند حسابداری دوبل استاندارد تجمیعی به مبلغ ${conversionAmount.toLocaleString('fa-IR')} ریال ایجاد کن.`
    : `بر اساس سند انبار زیر، یک سند حسابداری دوبل استاندارد به مبلغ ${conversionAmount.toLocaleString('fa-IR')} ریال ایجاد کن.`;
  
  return `
شما یک دستیار حسابداری هوشمند هستید. وظیفه شما تبدیل اسناد انبار به اسناد حسابداری استاندارد است.

${mainInstruction}

**مشخصات سند حسابداری درخواستی:**
- تاریخ سند: ${accountingDate || 'جاری'}
- شرح کلی سند: ${accountingDescription || 'بر اساس شابلون'}

**خلاصه اسناد انبار:**
${documentsSummary}

**قوانین حسابداری فعال (شابلون):**
این قوانین اولویت بالایی دارند. لطفاً دقیقاً از آنها پیروی کن. کد حساب و نام حساب را از روی لیست استخراج کن و در خروجی فقط نام حساب را بنویس.
${rulesSummary}
- برای حواله فروش (نوع 40)، علاوه بر ثبت بهای تمام شده، ثبت درآمد فروش را نیز با فرض 25% سود (نسبت به مبلغ تبدیل) انجام بده. (حسابهای دریافتنی بدهکار، درآمد فروش بستانکار)
- در توضیحات هر آرتیکل (فیلد description)، شماره سند(های) انبار مربوطه را ذکر کن.
- مقادیر مراکز هزینه را با خط تیره (-) از هم جدا کن (مثال: 'C100-C200').

لطفا خروجی را فقط در فرمت JSON و مطابق با اسکیمای ارائه شده برگردان. اطمینان حاصل کن که جمع بدهکار و بستانکار برابر و معادل ${conversionAmount.toLocaleString('fa-IR')} ریال باشد.
  `;
}

/**
 * NOTE ON ARCHITECTURE: In a real-world application, this function would not exist on the client-side.
 * The frontend would typically send only the IDs of the documents and conversion parameters to a secure backend API.
 * That backend API would then be responsible for:
 * 1. Securely connecting to the SQL database to fetch the full document details.
 * 2. Constructing the detailed prompt based on the fetched data and business rules.
 * 3. Calling the Gemini API using a key stored securely on the server.
 * 4. Returning the final journal entry JSON to the frontend.
 * This simulation keeps the logic on the client for demonstration purposes.
 */
export const generateAccountingDocument = async (
    docs: InventoryDocument[], 
    rules: AccountingRule[], 
    warehouses: Warehouse[],
    conversionAmount: number,
    accountingDate: string,
    accountingDescription: string
): Promise<JournalEntry> => {
    const model = 'gemini-2.5-flash';
    const prompt = createPrompt(docs, rules, warehouses, conversionAmount, accountingDate, accountingDescription);

    try {
        const response = await ai.models.generateContent({
            model: model,
            // The `contents` property is now structured as an array of Content objects.
            // Using a raw string for complex prompts can sometimes lead to parsing issues
            // that cause generic network errors. This format is more robust.
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        date: { type: Type.STRING },
                        description: { type: Type.STRING },
                        totalDebit: { type: Type.NUMBER },
                        totalCredit: { type: Type.NUMBER },
                        lines: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    row: { type: Type.INTEGER },
                                    accountCode: { type: Type.STRING },
                                    accountName: { type: Type.STRING },
                                    debit: { type: Type.NUMBER },
                                    credit: { type: Type.NUMBER },
                                    description: { type: Type.STRING },
                                    costCenter1: { type: Type.STRING },
                                    costCenter2: { type: Type.STRING },
                                    costCenter3: { type: Type.STRING },
                                },
                                required: ['row', 'accountCode', 'accountName', 'debit', 'credit', 'description']
                            }
                        }
                    },
                    required: ['date', 'description', 'totalDebit', 'totalCredit', 'lines']
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
        // Provide a more user-friendly error message in Persian, while still logging the technical details.
        const technicalDetails = error instanceof Error ? error.message : String(error);
        throw new Error(`خطا در ارتباط با مدل هوش مصنوعی. لطفا دوباره تلاش کنید. جزئیات فنی: ${technicalDetails}`);
    }
};

export const generateAccountingRules = async (
    combinations: { warehouse: Warehouse; docType: DocTypeInfo }[],
    hints: AutoGenRuleHint[],
    accounts: Account[],
    costCenters: CostCenterItem[]
): Promise<AccountingRule[]> => {
    const model = 'gemini-2.5-flash';

    const combinationsText = combinations.map((c, i) => 
        `${i + 1}. انبار: '${c.warehouse.name}' (ID: ${c.warehouse.id}), نوع سند: '${c.docType.name}' (Code: ${c.docType.id})`
    ).join('\n');

    const hintsText = hints.length > 0
        ? 'کاربر راهنمایی های زیر را ارائه کرده است. در صورت امکان و منطقی بودن، از آنها برای ساخت آرتیکل ها استفاده کن:\n' +
          hints.map(h => {
              const accountName = accounts.find(a => a.id === h.account)?.name || 'نامشخص';
              const costCenterNames = [h.costCenters.center1, h.costCenters.center2, h.costCenters.center3]
                  .filter(Boolean)
                  .map(ccId => costCenters.find(cc => cc.id === ccId)?.name)
                  .join(', ');
              let hintLine = `- تراکنش ${h.transactionType === 'Debit' ? 'بدهکار' : 'بستانکار'}`;
              if (h.account) hintLine += ` برای حساب '${accountName}' (کد: ${h.account})`;
              if (costCenterNames) hintLine += ` با مراکز هزینه: ${costCenterNames}`;
              return hintLine;
          }).join('\n')
        : 'هیچ راهنمایی توسط کاربر ارائه نشده است. لطفاً بر اساس دانش حسابداری استاندارد عمل کن.';

    const prompt = `
شما یک حسابدار خبره هستید. وظیفه شما تولید شابلون های صدور سند حسابداری برای تراکنش های انبار است.

**وظیفه اصلی:**
برای هر یک از ترکیب های زیر، یک شابلون (قانون) حسابداری کامل و استاندارد ایجاد کن. هر قانون باید حداقل یک ردیف بدهکار و یک ردیف بستانکار داشته باشد.

**ترکیب های مورد نیاز برای تولید شابلون:**
${combinationsText}

**راهنمایی های کاربر (اختیاری):**
${hintsText}

**اطلاعات موجود برای استفاده:**
- لیست حساب ها: ${accounts.map(a => `'${a.name}' (کد: ${a.id})`).join(', ')}
- لیست مراکز هزینه: ${costCenters.map(c => `'${c.name}' (کد: ${c.id})`).join(', ')}

**قوانین خروجی:**
- برای هر ترکیب، یک آبجکت قانون کامل تولید کن.
- \`docDescription\` باید شرحی مناسب و مرتبط با نوع سند و انبار باشد.
- \`lineDescription\` برای هر آرتیکل باید به طور واضح عملیات را توصیف کند.
- خروجی باید فقط و فقط یک آرایه JSON از آبجکت های قانون حسابداری باشد. هیچ متن اضافی یا توضیحی خارج از JSON قرار نده.
- اطمینان حاصل کن که ساختار خروجی دقیقا مطابق با اسکیمای ارائه شده باشد.
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING, description: "یک شناسه منحصر به فرد مانند auto-gen-rule-1" },
                            isActive: { type: Type.BOOLEAN, description: "همیشه باید true باشد" },
                            warehouseId: { type: Type.INTEGER },
                            docTypeCode: { type: Type.INTEGER },
                            docDescription: { type: Type.STRING },
                            actions: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        id: { type: Type.STRING, description: "یک شناسه منحصر به فرد مانند auto-gen-action-1" },
                                        transactionType: { type: Type.STRING, description: "باید 'Debit' یا 'Credit' باشد" },
                                        account: { type: Type.STRING, description: "کد حساب از لیست ارائه شده" },
                                        costCenters: {
                                            type: Type.OBJECT,
                                            properties: {
                                                center1: { type: Type.STRING },
                                                center2: { type: Type.STRING },
                                                center3: { type: Type.STRING },
                                            },
                                            // FIX: The properties of costCenters are required according to the RuleAction type.
                                            required: ['center1', 'center2', 'center3'],
                                        },
                                        // FIX: Added a description to make it consistent with other properties and potentially resolve a parser issue.
                                        lineDescription: { type: Type.STRING, description: "شرح ردیف برای این آرتیکل" },
                                    },
                                    required: ['id', 'transactionType', 'account', 'costCenters', 'lineDescription']
                                }
                            }
                        },
                        required: ['id', 'isActive', 'warehouseId', 'docTypeCode', 'docDescription', 'actions']
                    }
                }
            }
        });

        const jsonText = response.text.trim();
        const parsedResult = JSON.parse(jsonText) as AccountingRule[];
        return parsedResult;

    } catch (error) {
        console.error('Error generating accounting rules:', error);
        const technicalDetails = error instanceof Error ? error.message : String(error);
        throw new Error(`خطا در تولید خودکار شابلون. جزئیات فنی: ${technicalDetails}`);
    }
};