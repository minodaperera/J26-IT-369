// Small helpers shared by all modules.
export const errMsg = (e) => e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Something went wrong';
export const lkr = (n) => 'LKR ' + Math.round(n || 0).toLocaleString('en-LK');
