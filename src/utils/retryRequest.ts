import retry from "async-retry";
import axios, { AxiosRequestConfig } from "axios";

export const retryRequest = async <T = any>(url: string, config: AxiosRequestConfig = {}, maxRetries = 3): Promise<T> => {
  return retry(
    async () => {
      const res = await axios.get<T>(url, config);
      return res.data;
    },
    {
      retries: maxRetries,
      minTimeout: 500,   // initial delay
      maxTimeout: 3000,  // max delay between retries
      onRetry: (err:any, attempt:any) => {
        console.warn(`🔁 Retry ${attempt} for ${url} – ${err.message}`);
      },
    }
  );
};
