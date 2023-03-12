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
      let questionsApi = `http://localhost:3000/blog/${location.pathname.replace("getpost/", "getBlog/")}`;
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

          const blogApi=`http://localhost:3000/blog/deleteBlog/${docId}`;
        
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
    return ( <div className='text-center'>
        <div className="spinner-border" role="status">
          <span className="sr-only"></span>
        </div>
      </div>
    )
  }

  return (
    <>
      {(userData.userPriority>1) && <button onClick={()=>deleteBlog(blog._id)} title="Delete Blog" className="fixed z-90 bottom-10 right-8 bg-black w-14 h-14 rounded-full drop-shadow-lg flex justify-center items-center text-white text-s hover:bg-black hover:drop-shadow-2xl hover:animate-bounce duration-300">
        Delete
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
