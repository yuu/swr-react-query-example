import type { NextPage } from "next";
import useSWR, { useSWRConfig } from "swr";
import useSWRMutation from "swr/mutation";
import { sleep } from "@flutia/utils";
import { BASE_URL } from "@/lib";

type Post = { id: number; title: string };
type NewPost = Omit<Post, "id">;

const fetcher = async (url: string) => {
  await sleep(2000);
  const res = await fetch(new URL(url, BASE_URL).toString());
  return await res.json();
};

const createPost = async (post: NewPost) => {
  return fetch(new URL("/api/posts", BASE_URL).toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(post),
  });
};

const updatePost = async (url: string, { arg }: { arg: Post }) => {
  return fetch(new URL(url, BASE_URL).toString(), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  });
};

const Profile = () => {
  const { data, error, isLoading, mutate } = useSWR("/api/posts/1", fetcher);
  const { mutate: mutateWithConfig } = useSWRConfig();
  const { trigger, isMutating } = useSWRMutation("/api/posts/1", updatePost);
  console.log("isMutating", isMutating);

  const handleClick = () => {
    const newTitle = data.title.toUpperCase();
    return sleep(2000).then(() => mutate({ ...data, title: newTitle }));
  };

  const handleClick2 = () => {
    mutateWithConfig(
      "/api/posts",
      createPost({ title: "new post" }).then((user) => console.log(user))
    ).catch((err) => console.log(err));
  };

  const handleClick3 = async () => {
    await trigger({ ...data, title: data.title.toUpperCase() });
    await sleep(2000);
  };

  if (error) return <div>failed to load</div>;
  if (isLoading) return <div>loading...</div>;
  return (
    <>
      <div>hello {data.title}!</div>
      <button onClick={handleClick}>
        upper title with call mutate(...data: title: newTitle)
      </button>
      <button onClick={handleClick2}>new post</button>
      <button onClick={handleClick3}>
        {isMutating ? "updated..." : "update by trigger"}
      </button>
    </>
  );
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
