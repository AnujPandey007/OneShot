import React from 'react';
import { useNavigate, useLocation} from 'react-router-dom';
import { useUser } from '../context/userContext';

export default function GetPost({isAuth, setAlert}) {

  let navigate = useNavigate();
  let location = useLocation();
  const {userData} = useUser();

  const [blog, setBlog] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if(!isAuth){
      navigate('/login');
    }
    const getBlog = async()=>{
      let questionsApi = `https://oneshot-backend.onrender.com/blog/${location.pathname.replace("getpost/", "getBlog/")}`;
      let questionsData = await fetch(questionsApi);
      let jsonQuestionsData = await questionsData.json();
      setBlog(jsonQuestionsData);
      setIsLoading(false);
    }
    getBlog();

  }, [isAuth, navigate, location]);

  const deleteBlog = async(docId)=>{
    try{
        if(userData.userPriority>1){
          setAlert("Wait...", "info");

          const blogApi=`https://oneshot-backend.onrender.com/blog/deleteBlog/${docId}`;
        
          const requestOptions = {
              method: 'DELETE',
              headers: {'Content-Type': 'application/json'},
          };
          
          const blogData = await fetch(blogApi, requestOptions);
          let jsonBlogData = await blogData.json();
          console.log(jsonBlogData);    
        
          setAlert("Post is deleted.", "success");
          navigate('/');
        }else{
          setAlert("You cannot delete", "danger");
          console.log("Error");
        }
        
    }catch(e){
      console.log(e);
    }
  }

  if(isLoading){
    return ( 
      <div className="flex items-center justify-center h-screen">
        <div role="status">
            <svg aria-hidden="true" className="inline w-10 h-10 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
            <span className="sr-only">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <>
      {(userData.userPriority>1) && 
      <button onClick={()=>deleteBlog(blog._id)} title="Delete Blog" className="fixed z-90 bottom-10 right-8 bg-black w-14 h-14 rounded-full drop-shadow-lg flex justify-center items-center text-white text-s">
       &#x2715;
      </button>}

      <div className='flex flex-col items-center w-full h-full justify-center self-center'>
        {blog.length===0 && <div className="h2 text-dark mb-4 text-3xl font-bold sm:text-4xl md:text-[40px]">Blogs are not Available</div>}
      </div>

      <main className="pt-8 pb-16 lg:pt-16 lg:pb-24 bg-white dark:bg-gray-900">
      <div className="flex justify-between px-4 mx-auto max-w-screen-xl ">
          <article className="mx-auto w-full max-w-2xl format format-sm sm:format-base lg:format-lg format-blue dark:format-invert">
            <header className="mb-4 lg:mb-6 not-format">
              <address className="flex items-center mb-6 not-italic">
                  <div className="inline-flex items-center mr-3 text-sm text-gray-900 dark:text-white">
                      <img className="mr-4 w-16 h-16 rounded-full" src={blog.userImage} alt={blog.userId}/>
                      <div>
                          <div rel="author" className="text-xl font-bold text-gray-900 dark:text-white">{blog.userName}</div>
                          <p className="text-base font-light text-gray-500 dark:text-gray-400">{blog.blogTag}</p>
                          <p className="text-base font-light text-gray-500 dark:text-gray-400">{new Date(blog.blogTime).toLocaleString()}</p>
                      </div>
                  </div>
              </address>
              <h1 className="mb-4 text-3xl font-extrabold leading-tight text-gray-900 lg:mb-6 lg:text-4xl dark:text-white">{blog.blogTitle}</h1>
            </header>
            
           <img src={blog.blogImage} alt={blog._id}/>

            <div className='mt-4 first-letter:text-4xl first-letter:font-bold'>
                {blog.blogText}
            </div>

          </article>
        </div>
      </main>
    </>
  )
}
