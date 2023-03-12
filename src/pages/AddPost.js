import React from 'react';
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

  const [imageUpload, setImageUpload] = React.useState("");
  let imageUrl = "";

  React.useEffect(() => {
    if(!isAuth){
      navigate('/login');
    }
    
  }, [isAuth, navigate]);


  const handleTitle = (event)=>{
    setTitle(event.target.value);
  }

  const handleBlogTag=(event)=>{
    setBlogTag(event.target.value)
  }

  const handlePost = (event)=>{
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
    setIsLoading(true);
    try{
      if(title.length!==0&&post.length!==0&&imageUpload!==""&&blogTag!==""){
        setAlert("Blog is being added", "info");
        await uploadImage();
        const blogApi="http://localhost:3000/blog/addBlog";

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
          <select defaultValue={blogTag} onChange={handleBlogTag} className="w-full p-2.5 text-gray-500 bg-white border rounded-md shadow-sm outline-none appearance-none">
            <option value={""} disabled={true}>Select here...</option>
            <option>Entertainment</option>
            <option>Sports</option>
            <option>Food</option>
            <option>Travel</option>
            <option>Fashion</option>
            <option>Photography</option>
            <option>Science</option>
          </select>
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

        {/* <div className="w-full px-4 ">
          <div className="mb-5">
            <label className="mb-3 block text-base font-medium text-black">
            Upload Image
            </label>
            <div className="relative">
                <label htmlFor="file" className="flex min-h-[175px] w-full cursor-pointer items-center justify-center rounded-md border border-dashed border-primary p-6">
                  <div>
                      <input type="file" name="file" id="file" className="sr-only/" accept="image/*" onChange={handleImage}/>
                      <span className="mx-auto mb-3 flex h-[50px] w-[50px] items-center justify-center rounded-full border border-stroke bg-white">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M2.5013 11.666C2.96154 11.666 3.33464 12.0391 3.33464 12.4993V15.8327C3.33464 16.0537 3.42243 16.2657 3.57871 16.4219C3.73499 16.5782 3.94695 16.666 4.16797 16.666H15.8346C16.0556 16.666 16.2676 16.5782 16.4239 16.4219C16.5802 16.2657 16.668 16.0537 16.668 15.8327V12.4993C16.668 12.0391 17.0411 11.666 17.5013 11.666C17.9615 11.666 18.3346 12.0391 18.3346 12.4993V15.8327C18.3346 16.4957 18.0712 17.1316 17.6024 17.6004C17.1336 18.0693 16.4977 18.3327 15.8346 18.3327H4.16797C3.50493 18.3327 2.86904 18.0693 2.4002 17.6004C1.93136 17.1316 1.66797 16.4957 1.66797 15.8327V12.4993C1.66797 12.0391 2.04106 11.666 2.5013 11.666Z" fill="#3056D3"></path>
                            <path fillRule="evenodd" clipRule="evenodd" d="M9.41074 1.91009C9.73618 1.58466 10.2638 1.58466 10.5893 1.91009L14.7559 6.07676C15.0814 6.4022 15.0814 6.92984 14.7559 7.25527C14.4305 7.58071 13.9028 7.58071 13.5774 7.25527L10 3.67786L6.42259 7.25527C6.09715 7.58071 5.56951 7.58071 5.24408 7.25527C4.91864 6.92984 4.91864 6.4022 5.24408 6.07676L9.41074 1.91009Z" fill="#3056D3"></path>
                            <path fillRule="evenodd" clipRule="evenodd" d="M10.0013 1.66602C10.4615 1.66602 10.8346 2.03911 10.8346 2.49935V12.4994C10.8346 12.9596 10.4615 13.3327 10.0013 13.3327C9.54106 13.3327 9.16797 12.9596 9.16797 12.4994V2.49935C9.16797 2.03911 9.54106 1.66602 10.0013 1.66602Z" fill="#3056D3"></path>
                        </svg>
                      </span>
                  </div>
                </label>
            </div>
          </div>
        </div> */}
        
        <div className="w-full px-4">
          <div className="mb-12">
            <label htmlFor="" className="mb-3 block text-base font-medium text-black">
              Upload Image
            </label>
            <input type="file" accept="image/*" onChange={handleImage} className="border-form-stroke text-body-color placeholder-body-color focus:border-primary active:border-primary file:border-form-stroke file:text-body-color file:hover:bg-primary w-full cursor-pointer rounded-lg border-[1.5px] font-medium outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:bg-[#F5F7FD] file:py-3 file:px-5 file:hover:bg-opacity-10 disabled:cursor-default disabled:bg-[#F5F7FD]"/>
          </div>
        </div>

        <div className='pl-4'>
          <button type="button" disabled={isLoading} onClick={addBlog} className="text-white bg-black hover:bg-black focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Submit</button>
        </div>
      </div>
    </>
  )
}
