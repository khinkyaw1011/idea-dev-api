export const errorHandler = (err, req, res, next) => {
  // Status Code မရှိပါက 500 (Internal Server Error) ဟု သတ်မှတ်ခြင်း
  const statusCode = res.statusCode ? res.statusCode : 500;

  res.json({
    message: err.message,
    // Production Mode မဟုတ်ပါက Debug လုပ်ရန် Stack Trace ဖော်ပြမည်
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};