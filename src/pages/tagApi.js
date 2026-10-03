export const BLOG_TAGS = ["Entertainment", "Sports", "Food", "Travel", "Fashion", "Photography", "Science"];

export async function predictBlogTag(blog, signal) {
  const base = (process.env.REACT_APP_TAG_API_URL || "").replace(/\/+$/, "");
  if (!base) throw new Error("Set REACT_APP_TAG_API_URL and restart the frontend to enable AI suggestions.");
  const response = await fetch(`${base}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ blogTitle: blog.blogTitle, blogText: blog.blogText }),
    signal,
  });
  if (!response.ok) throw new Error(`Tag suggestion failed (${response.status}). You can select a tag manually.`);
  const result = await response.json();
  if (result.blogTag !== null && !BLOG_TAGS.includes(result.blogTag)) {
    throw new Error("The tag service returned an unsupported tag.");
  }
  return result;
}
