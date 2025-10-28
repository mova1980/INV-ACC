import { GoogleGenAI, Type } from '@google/genai';
import { InventoryDocument, JournalEntry, AccountingRule, Warehouse, Account, CostCenterItem, DocTypeInfo, AutoGenRuleHint, RuleAction } from '../types';

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
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        date: { type: Type.STRING, description: "The date of the accounting document in YYYY/MM/DD format." },
                        description: { type: Type.STRING, description: "A general description for the entire accounting document." },
                        totalDebit: { type: Type.NUMBER, description: "The sum of all debit amounts. Must equal totalCredit." },
                        totalCredit: { type: Type.NUMBER, description: "The sum of all credit amounts. Must equal totalDebit." },
                        lines: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    row: { type: Type.INTEGER, description: "The sequential line number of the journal entry." },
                                    accountCode: { type: Type.STRING, description: "The unique code for the account." },
                                    accountName: { type: Type.STRING, description: "The name of the account." },
                                    debit: { type: Type.NUMBER, description: "The debit amount for the line. Should be 0 if credit is non-zero." },
                                    credit: { type: Type.NUMBER, description: "The credit amount for the line. Should be 0 if debit is non-zero." },
                                    description: { type: Type.STRING, description: "A detailed description for this specific journal line." },
                                    costCenter1: { type: Type.STRING, description: "Optional. The ID for the first cost center. Should be an empty string if not applicable." },
                                    costCenter2: { type: Type.STRING, description: "Optional. The ID for the second cost center. Should be an empty string if not applicable." },
                                    costCenter3: { type: Type.STRING, description: "Optional. The ID for the third cost center. Should be an empty string if not applicable." },
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
        const technicalDetails = error instanceof Error ? error.message : JSON.stringify(error);
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
- برای هر ترکیب، یک آبجکت قانون با \`docDescription\` و \`lineDescription\` مناسب تولید کن.
- خروجی باید فقط یک آرایه JSON از آبجکت های قانون حسابداری باشد، دقیقا مطابق با اسکیمای ارائه شده.
`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    description: "An array of accounting rule objects.",
                    items: {
                        type: Type.OBJECT,
                        description: "A single accounting rule (template).",
                        properties: {
                            warehouseId: { type: Type.INTEGER, description: "The related warehouse ID." },
                            docTypeCode: { type: Type.INTEGER, description: "The related document type code." },
                            docDescription: { type: Type.STRING, description: "A general description for the accounting rule." },
                            actions: {
                                type: Type.ARRAY,
                                description: "Array of debit/credit operations. Each rule must have at least one Debit and one Credit line.",
                                items: {
                                    type: Type.OBJECT,
                                    description: "A single debit or credit line in the journal entry.",
                                    properties: {
                                        transactionType: { type: Type.STRING, description: "Transaction type. Must be exactly 'Debit' or 'Credit'. Do not use Persian equivalents." },
                                        account: { type: Type.STRING, description: "The account code from the provided list." },
                                        costCenters: {
                                            type: Type.OBJECT,
                                            description: "An object for cost centers. It must include three keys: 'center1', 'center2', and 'center3'.",
                                            properties: {
                                                center1: { type: Type.STRING, description: "First cost center code. Use an empty string if not applicable." },
                                                center2: { type: Type.STRING, description: "Second cost center code. Use an empty string if not applicable." },
                                                center3: { type: Type.STRING, description: "Third cost center code. Use an empty string if not applicable." },
                                            },
                                            required: ['center1', 'center2', 'center3'],
                                        },
                                        lineDescription: { type: Type.STRING, description: "The line description for this article." },
                                    },
                                    required: ['transactionType', 'account', 'costCenters', 'lineDescription']
                                }
                            }
                        },
                        required: ['warehouseId', 'docTypeCode', 'docDescription', 'actions']
                    }
                }
            }
        });

        const jsonText = response.text.trim();
        
        type RawRule = Omit<AccountingRule, 'id' | 'isActive'> & {
            actions: Omit<RuleAction, 'id'>[];
        };
        const parsedResult = JSON.parse(jsonText) as RawRule[];

        // Post-process to add IDs and isActive flag. This is more robust.
        const processedRules: AccountingRule[] = parsedResult.map((rawRule, ruleIndex) => ({
            ...rawRule,
            id: `auto-gen-rule-${Date.now()}-${ruleIndex}`,
            isActive: true,
            actions: rawRule.actions.map((rawAction, actionIndex) => ({
                ...rawAction,
                id: `auto-gen-action-${Date.now()}-${ruleIndex}-${actionIndex}`,
            })),
        }));

        return processedRules;

    } catch (error) {
        console.error('Error generating accounting rules:', error);
        const technicalDetails = error instanceof Error ? error.message : JSON.stringify(error);
        throw new Error(`خطا در تولید خودکار شابلون. جزئیات فنی: ${technicalDetails}`);
    }
};