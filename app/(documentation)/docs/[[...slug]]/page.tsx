import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Markdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { getDoc, getAllSlugs } from "@/lib/docs";

type Props = { params: Promise<{ slug?: string[] }> };

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug: [slug] }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDoc(slug?.[0] ?? "introduction");
  return { title: doc?.meta.title, description: doc?.meta.description };
}

// Strips react-markdown's `node` prop so it isn't passed to the DOM.
function omitNode<T extends object>(props: T): Omit<T, "node"> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { node, ...rest } = props as T & { node?: unknown };
  return rest;
}

const components: Components = {
  h1: (p) => (
    <h1
      className="mt-10 scroll-mt-28 text-2xl font-bold tracking-tight text-white md:mt-12 md:text-3xl"
      {...omitNode(p)}
    />
  ),
  h2: (p) => (
    <h2
      className="mt-10 scroll-mt-28 border-b border-neutral-800 pb-2 text-xl font-semibold text-white md:mt-12 md:text-2xl"
      {...omitNode(p)}
    />
  ),
  h3: (p) => (
    <h3
      className="mt-8 scroll-mt-28 text-lg font-semibold text-white md:text-xl"
      {...omitNode(p)}
    />
  ),
  p: (p) => (
    <p
      className="mt-4 break-words text-[15px] leading-7 text-neutral-300"
      {...omitNode(p)}
    />
  ),
  a: (p) => (
    <a
      className="font-medium text-white underline decoration-neutral-600 underline-offset-4 transition-colors hover:decoration-white"
      {...omitNode(p)}
    />
  ),
  ul: (p) => (
    <ul
      className="mt-4 list-disc space-y-2 pl-6 text-[15px] leading-7 text-neutral-300 marker:text-neutral-600"
      {...omitNode(p)}
    />
  ),
  ol: (p) => (
    <ol
      className="mt-4 list-decimal space-y-2 pl-6 text-[15px] leading-7 text-neutral-300 marker:text-neutral-500"
      {...omitNode(p)}
    />
  ),
  li: (p) => <li className="pl-1" {...omitNode(p)} />,
  strong: (p) => (
    <strong className="font-semibold text-white" {...omitNode(p)} />
  ),
  blockquote: (p) => (
    <blockquote
      className="my-6 border-l-2 border-neutral-700 pl-4 text-neutral-400"
      {...omitNode(p)}
    />
  ),
  hr: () => <hr className="my-10 border-neutral-800" />,
  pre: (p) => (
    <pre
      className="mt-5 max-w-full overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-sm leading-relaxed"
      {...omitNode(p)}
    />
  ),
  code: ({ className, children, ...rest }) => {
    const isBlock = /language-/.test(className ?? "");
    if (isBlock)
      return (
        <code className={className} {...omitNode(rest)}>
          {children}
        </code>
      );
    return (
      <code
        className="break-words rounded-md bg-neutral-800 px-1.5 py-0.5 text-[0.85em] text-neutral-200"
        {...omitNode(rest)}
      >
        {children}
      </code>
    );
  },
  table: (p) => (
    <div className="my-6 block w-full max-w-full overflow-x-auto rounded-lg border border-neutral-800">
      <table className="w-full border-collapse text-sm" {...omitNode(p)} />
    </div>
  ),
  thead: (p) => <thead className="bg-neutral-900" {...omitNode(p)} />,
  th: (p) => (
    <th
      className="whitespace-nowrap border-b border-neutral-800 px-4 py-2.5 text-left font-semibold text-white"
      {...omitNode(p)}
    />
  ),
  td: (p) => (
    <td
      className="border-b border-neutral-800/60 px-4 py-2.5 text-neutral-300"
      {...omitNode(p)}
    />
  ),
  img: (p) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="my-6 h-auto w-full rounded-lg border border-neutral-800 object-cover sm:object-contain"
      alt=""
      {...omitNode(p)}
    />
  ),
};

export default async function DocPage({ params }: Props) {
  const { slug } = await params;
  const doc = getDoc(slug?.[0] ?? "introduction");
  if (!doc) notFound();

  return (
    <article className="min-w-0 max-w-full overflow-hidden px-1 sm:px-0">
      {doc.meta.title && (
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            {doc.meta.title}
          </h1>
          {doc.meta.description && (
            <p className="mt-3 text-[15px] text-neutral-400 sm:text-base">
              {doc.meta.description}
            </p>
          )}
        </header>
      )}
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {doc.content}
      </Markdown>
    </article>
  );
}
