import type { NextPage } from "next";
import useSWR from "swr";
import { sleep } from "@flutia/utils";
import { BASE_URL } from "@/lib";

const fetcher = async (url: string) => {
  await sleep(2000);
  const res = await fetch(new URL(url, BASE_URL).toString());
  return await res.json();
};

const Profile = () => {
  const { data, error, isLoading } = useSWR("/api/posts", fetcher);

  if (error) return <div>failed to load</div>;
  if (isLoading) return <div>loading...</div>;
  return <div>hello {data[0].title}!</div>;
};

const SwrPage: NextPage = () => {
  return (
    <>
      <h1>Using SWR</h1>
      <Profile />
    </>
  );
};

export default SwrPage;
