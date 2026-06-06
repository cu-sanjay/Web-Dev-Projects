import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import service from "../appwrite/confi";
import { Button, Container } from "../components";
import parse from "html-react-parser";
import { useSelector } from "react-redux";

export default function Post() {
  const [post, setPost] = useState(null);
  const { slug } = useParams();
  const navigate = useNavigate();

  const userData = useSelector((state) => state.auth.userData);

  const isAuthor = post && userData ? post.userId === userData.$id : false;

  useEffect(() => {
    if (slug) {
      service.getPost(slug).then((post) => {
        if (post) setPost(post);
        else navigate("/");
      });
    } else navigate("/");
  }, [slug, navigate]);
  const deletePost = () => {
    service.deletePost(post.$id).then((status) => {
      if (status) {
        service.deleteFile(post.featuredImage);
        navigate("/");
      }
    });
  };

  return post ? (
    <div className="py-10">
      <Container>
        <article className="mx-auto max-w-5xl">
        <div className="relative mb-8 flex w-full justify-center overflow-hidden rounded-lg border border-stone-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <img
            src={service.getFileView(post.featuredImage)}
            alt={post.title}
            className="max-h-140 w-full rounded-md object-cover"
          />
          {isAuthor && (
            <div className="absolute right-6 top-6 flex gap-2">
              <Link to={`/edit-post/${post.$id}`}>
                <Button bgColor="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400">
                  Edit
                </Button>
              </Link>
              <Button bgColor="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400" onClick={deletePost}>
                Delete
              </Button>
            </div>
          )}
        </div>
        <div className="w-full mb-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">Article</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-950 dark:text-white">{post.title}</h1>
        </div>
        <div className="browser-css rounded-lg border border-stone-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">{parse(post.content)}</div>
        </article>
      </Container>
    </div>
  ) : null;
}
