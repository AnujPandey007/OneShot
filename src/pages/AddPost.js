import React from 'react';
import { BLOG_TAGS, predictBlogTag } from '../pages/tagApi';
import { useNavigate } from 'react-router-dom';
import { storage, auth } from '../config/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 } from 'uuid';
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
  let imageUrl = "";

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

  const uploadImage = async()=> {
    if(imageUpload!==""){
      const imageRef = ref(storage, `images/${imageUpload.name + v4()}`);
      const result = await uploadBytes(imageRef, imageUpload);
      const imgUrl = await getDownloadURL(result.ref);
      imageUrl = imgUrl;
    }
  }

  const addBlog = async()=>{
    invalidatePrediction();
    setIsLoading(true);
    try{
      if(title.length!==0&&post.length!==0&&imageUpload!==""&&blogTag!==""){
        setAlert("Blog is being added", "info");
        await uploadImage();
        const blogApi="https://oneshot-backend.onrender.com/blog/addBlog";

        const jsonData={
          "userId": userData._id,
          "userName": auth.currentUser.displayName,
          "userImage": auth.currentUser.photoURL,
          "blogTitle": title,
          "blogText": post,
          "blogImage": imageUrl,
          "likes": 1,
          "blogTag": blogTag
        }
        
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(jsonData)
        };
        
        const blogData = await fetch(blogApi, requestOptions);
        let jsonBlogData = await blogData.json();
        console.log(jsonBlogData);
      
        setAlert("Your post is uploaded.", "success");
        navigate('/');
      }else{
        setAlert("Please Fill Up All The Forms", "danger");
      }
    }catch(e){
      console.log(e);
    }
    setIsLoading(false);
  }

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
              Upload Image
            </label>
            <input type="file" accept="image/*" onChange={handleImage} className="border-form-stroke text-body-color placeholder-body-color focus:border-primary active:border-primary file:border-form-stroke file:text-body-color file:hover:bg-primary w-full cursor-pointer rounded-lg border-[1.5px] font-medium outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:bg-[#F5F7FD] file:py-3 file:px-5 file:hover:bg-opacity-10 disabled:cursor-default disabled:bg-[#F5F7FD]"/>
          </div>
        </div>

        <div className='pl-4'>
          <button type="button" disabled={isLoading || isPredicting} onClick={addBlog} className="text-white bg-black hover:bg-black focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Submit</button>
        </div>
      </div>
    </>
  )
}
