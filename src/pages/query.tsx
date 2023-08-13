import { useState } from "react";
import type { NextPage } from "next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { fetcher, BASE_URL } from "@/lib";

type Post = { id: number; title: string };

const Profile = () => {
  const queryClient = useQueryClient();

  const queryKey = ["api/posts/", "1"];

  const { data, isLoading, error } = useQuery({
    queryKey: ["api/posts/", "1"],
    queryFn: async (args) => fetcher(args.queryKey.join("/")),
    select: (data) => {
      // e.g. if use toString, data type is string | undefined
      // i.g io-ts type check?
      // throw new Error('type error')
      return data;
    },
    cacheTime: 1000, // test
  });

  const mutation = useMutation<Post, Error, Post, { rollback: () => void }>({
    mutationFn: async (data) => {
      await fetch(new URL(queryKey.join("/"), BASE_URL).toString(), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return Promise.resolve(data);
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (prevData: any) => {
        return { ...prevData, newData };
      });
      return {
        rollback: () => queryClient.setQueryData(queryKey, previousData),
      };
    },
    onError: (error, _variables, context) => {
      toast.error(`Error: ${(error as Error).message}`);
      context?.rollback();
    },
    onSuccess: (_data, _variables, _context) => {
      toast.success("Successed");
    },
  });

  const handleClick = () => {
    mutation.mutate({ id: data.id, title: data.title.toUpperCase() });
  };
  const handleClick2 = () => undefined;
  const handleClick3 = () => undefined;

  if (mutation.isError) return <div>mutation error</div>;
  if (mutation.isLoading) return <div>mutation...</div>;

  if (error) return <div>failed to load: {(error as Error).message}</div>;
  if (isLoading) return <div>loading...</div>;
  return (
    <>
      <div>hello {data.title}!</div>
      <button onClick={handleClick}>
        upper title with call mutate(...data: title: newTitle)
      </button>
      <button onClick={handleClick2}>new post</button>
      <button onClick={handleClick3}>update by trigger</button>
      {mutation.isSuccess && <div>mutation successed</div>}
    </>
  );
};

const QueryPage: NextPage = () => {
  const [visible, setVisible] = useState(true);
  const toggle = () => setVisible((prev) => !prev);

  return (
    <>
      <div>Using Query</div>
      <button onClick={toggle}>toggle visible</button>
      {visible && <Profile />}
    </>
  );
};

export default QueryPage;
