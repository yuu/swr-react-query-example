import { sleep } from "@flutia/utils";

export const BASE_URL = new URL(process.env.NEXT_PUBLIC_BASE_URL!);

export const fetcher = async (url: string) => {
  await sleep(2000);
  const res = await fetch(new URL(url, BASE_URL).toString());
  return await res.json();
};
