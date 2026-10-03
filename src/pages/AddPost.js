import React from 'react';
import { BLOG_TAGS, predictBlogTag } from '../pages/tagApi';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebaseConfig';
import { BLOG_API_URL, uploadBlogImage } from '../services/cloudinaryUpload';
import { useUser } from '../context/userContext';

export default function AddPost({isAuth, setAlert}) {
  let navigate = useNavigate();
  const {userData} = useUser();

  const [title, setTitle] = React.useState("");
  const [post, setPost] = React.useState("");
  const [blogTag, setBlogTag] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isPredicting, setIsPredicting] = React.useState(false);
  const [tagMessage, setTagMessage] = React.useState("");
  const predictionRequest = React.useRef(null);
  const editVersion = React.useRef(0);

  React.useEffect(() => () => predictionRequest.current?.abort(), []);

  const invalidatePrediction = () => {
    editVersion.current += 1;
    predictionRequest.current?.abort();
    predictionRequest.current = null;
    setIsPredicting(false);
    setTagMessage("");
  };

  const suggestTag = async () => {
    if (post.trim().length < 20) {
      setTagMessage("Write at least 20 characters in your description first.");
      return;
    }
    predictionRequest.current?.abort();
    const controller = new AbortController();
    predictionRequest.current = controller;
    const version = editVersion.current;
    const timeout = setTimeout(() => controller.abort(), 90000);
    setIsPredicting(true);
    setTagMessage("Finding a tag… The service may take a minute to wake up.");
    try {
      const result = await predictBlogTag({ blogTitle: title, blogText: post }, controller.signal);
      if (version !== editVersion.current || predictionRequest.current !== controller) return;
      if (!result.blogTag) {
        setTagMessage("No suitable tag found. Please select one manually.");
        return;
      }
      setBlogTag(result.blogTag);
      setTagMessage(result.demo
        ? `Demo model suggests ${result.blogTag}. Please check it before submitting.`
        : `Suggested ${result.blogTag}.${result.needsReview ? " Please review this uncertain suggestion." : " You can change it before submitting."}`);
    } catch (error) {
      if (version === editVersion.current && predictionRequest.current === controller) {
        setTagMessage(error.name === "AbortError"
          ? "The service took too long. Try again or select a tag manually."
          : error.message);
      }
    } finally {
      clearTimeout(timeout);
      if (predictionRequest.current === controller) {
        predictionRequest.current = null;
        setIsPredicting(false);
      }
    }
  };

  const [imageUpload, setImageUpload] = React.useState("");
  const [includeImage, setIncludeImage] = React.useState(false);
  const [submitError, setSubmitError] = React.useState("");
  const submitting = React.useRef(false);

  React.useEffect(() => {
    if(!isAuth){
      navigate('/login');
    }
    
  }, [isAuth, navigate]);


  const handleTitle = (event)=>{
    invalidatePrediction();
    setTitle(event.target.value);
  }

  const handleBlogTag=(event)=>{
    invalidatePrediction();
    setBlogTag(event.target.value)
  }

  const handlePost = (event)=>{
    invalidatePrediction();
    setPost(event.target.value);
  }

  const handleImage = (event)=>{
    setImageUpload(event.target.files[0]);
  }

  const addBlog = async () => {
    if (submitting.current) return;
    setSubmitError("");
    if (!title.trim() || !post.trim() || !blogTag) {
      setSubmitError("Please enter a title, description, and tag. An image is optional.");
      return;
    }
    if (!auth.currentUser || !userData?._id) {
      setSubmitError("Your account is still loading. Please try again or sign in again.");
      return;
    }
    if (includeImage && !imageUpload) {
      setSubmitError("Choose an image or uncheck Include an image to publish without one.");
      return;
    }
    invalidatePrediction();
    submitting.current = true;
    setIsLoading(true);
    try {
      let imageUrl = "";
      if (includeImage) {
        setAlert("Uploading image…", "info");
        try {
          imageUrl = await uploadBlogImage(imageUpload);
        } catch (error) {
          throw new Error(`${error.message} You can uncheck Include an image to publish without it.`);
        }
      }
      setAlert("Saving your post…", "info");
      const response = await fetch(`${BLOG_API_URL}/blog/addBlog`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userData._id,
          userName: auth.currentUser.displayName,
          userImage: auth.currentUser.photoURL,
          blogTitle: title.trim(),
          blogText: post.trim(),
          blogImage: imageUrl,
          likes: 1,
          blogTag,
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        const detail = typeof result === "string" ? result : result?.message || result?.error;
        throw new Error(typeof detail === "string" ? detail : `Could not save your post (${response.status}). Please try again.`);
      }
      if (!result?._id) {
        throw new Error("The server did not confirm that your post was saved. Check your posts before trying again.");
      }
      setAlert("Your post is uploaded.", "success");
      navigate('/');
    } catch (error) {
      setSubmitError(error.message || "Could not save your post. Please try again.");
      setAlert("Your post could not be saved. See the message below the form.", "danger");
    } finally {
      submitting.current = false;
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className='flex flex-col items-center'>
        <div className="w-full px-4 ">
          <div className="mb-5">
            <label htmlFor="" className="mb-3 block text-base font-medium text-black">
            Title
            </label>
            <input
                type="text"
                onChange={handleTitle}
                placeholder="Type here.."
                className="border-form-stroke text-body-color placeholder-body-color focus:border-primary active:border-primary w-full rounded-lg border-[1.5px] py-3 px-5 font-medium outline-none transition disabled:cursor-default disabled:bg-[#F5F7FD]"
                />
          </div>
        </div>

        <div className="w-full px-4 mb-5">
          <label htmlFor="" className="mb-3 block text-base font-medium text-black">
          Select Tag
          </label>
          <select aria-label="Blog tag" value={blogTag} onChange={handleBlogTag} className="w-full p-2.5 text-gray-500 bg-white border rounded-md shadow-sm outline-none appearance-none">
            <option value={""} disabled={true}>Select here...</option>
            {BLOG_TAGS.map(tag => <option key={tag} value={tag}>{tag}</option>)}
          </select>
          <button type="button" onClick={suggestTag} disabled={isPredicting || isLoading || post.trim().length < 20}
            className="mt-3 rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50">
            {isPredicting ? "Predicting…" : "Suggest tag using AI"}
          </button>
          <p role="status" aria-live="polite" className="mt-2 text-sm text-gray-600">{tagMessage}</p>
        </div>
        
        <div className="w-full px-4 ">
          <div className="mb-5">
            <label htmlFor="" className="mb-3 block text-base font-medium text-black">
            Description
            </label>
            <textarea
                rows="3"
                placeholder="Type here.."
                onChange={handlePost}
                className="border-form-stroke text-body-color placeholder-body-color focus:border-primary active:border-primary w-full rounded-lg border-[1.5px] py-3 px-5 font-medium outline-none transition disabled:cursor-default disabled:bg-[#F5F7FD]"
            ></textarea>
          </div>
        </div>


        
        <div className="w-full px-4">
          <div className="mb-12">
            <label htmlFor="" className="mb-3 block text-base font-medium text-black">
              <input type="checkbox" checked={includeImage} disabled={isLoading}
                onChange={event => { setIncludeImage(event.target.checked); setSubmitError(""); }} />
              {" "}Include an image (optional)
            </label>
            <input aria-label="Upload image" disabled={!includeImage || isLoading} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} className="border-form-stroke text-body-color placeholder-body-color focus:border-primary active:border-primary file:border-form-stroke file:text-body-color file:hover:bg-primary w-full cursor-pointer rounded-lg border-[1.5px] font-medium outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:bg-[#F5F7FD] file:py-3 file:px-5 file:hover:bg-opacity-10 disabled:cursor-default disabled:bg-[#F5F7FD]"/>
          </div>
        </div>

        <div className="w-full px-4 mb-4">
          <p className="text-sm text-gray-600">Images: JPG, PNG, or WebP up to 5 MB. Leave the image option unchecked to publish a text-only post.</p>
          {submitError && <p role="alert" className="mt-2 text-red-600">{submitError}</p>}
        </div>
        <div className='pl-4'>
          <button type="button" disabled={isLoading || isPredicting} onClick={addBlog} className="text-white bg-black hover:bg-black focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Submit</button>
        </div>
      </div>
    </>
  )
}
