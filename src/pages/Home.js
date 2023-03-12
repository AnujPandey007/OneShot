import React from 'react';
// import backgroundImage from "../assets/1.jpg";
import { useNavigate, Link } from 'react-router-dom';

export default function Home({isAuth}) {
  let navigate = useNavigate();

  const [blogs, setBlogs] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if(!isAuth){
      navigate('/login');
    }
    const getBlogs = async()=>{
      let blogApi = `http://localhost:3000/blog/getBlogs`;
      let blogsData = await fetch(blogApi);
      let jsonBlogsData = await blogsData.json();
      setBlogs(jsonBlogsData);
      setIsLoading(false)
    }
    getBlogs();

  }, [isAuth, navigate]);

  function addBlog() {
    try {
      navigate("/addpost");
    } catch(e) {
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
      <button onClick={addBlog} title="Add Blog" className="fixed z-90 bottom-10 right-8 bg-black w-14 h-14 rounded-full drop-shadow-lg flex justify-center items-center text-white text-s hover:bg-black hover:drop-shadow-2xl hover:animate-bounce duration-300">
         Add
      </button>
      
      {blogs.length!==0 &&  <section className="pt-10 pb-10 lg:pt-[10px] lg:pb-20">
        <div className="container mx-auto">
          <div className="-mx-4 flex flex-wrap justify-center">
            <div className="w-full px-4">
              <div className="mx-auto mb-[60px] max-w-[510px] text-center lg:mb-20">
                <span className="text-primary mb-2 block text-lg font-semibold">
                  ONESHOT
                </span>
                <h2
                  className="text-dark mb-4 text-3xl font-bold sm:text-4xl md:text-[40px]"
                >
                  Our Recent Blogs
                </h2>
                <p className="text-body-color text-base">
                  There are many kinds of blogs including sports, food, travel, lifestyle, fashion, photography and science.
                </p>
              </div>
            </div>
          </div>
          <div className="-mx-4 flex flex-wrap">
            {blogs.map((doc)=> {
              return (<div key={doc._id} className="w-full px-4 md:w-1/2 lg:w-1/3">
              <Link to={`/getpost/${doc._id}`}>
                  <div className="mx-auto mb-10 max-w-[370px]">
                    <div className="mb-8 overflow-hidden rounded w-96 h-60">
                      <img
                        src={doc.blogImage}
                        alt={doc._id}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <div className='flex flex-row items-end place-content-between	mb-4'>
                        <div className='flex flex-row items-center'>
                            <div className="w-6 h-6 mr-1">
                              <img src={doc.userImage} alt={doc.userId} className="shadow-lg rounded max-w-full h-auto align-middle border-none"/>
                            </div>
                            <div className="font-bold md:flex text-sm">
                                {doc.userName}
                            </div>
                        </div>
                        <span className="bg-primary inline-block rounded px-4 text-center text-xs font-semibold leading-loose text-black">
                          {new Date(doc.blogTime).toLocaleString()}
                        </span>
                      </div>
                      <h3>
                        <div className="text-dark hover:text-primary mb-4 inline-block text-xl font-semibold sm:text-2xl lg:text-xl xl:text-2xl">
                          {doc.blogTitle}
                        </div>
                      </h3>
                      <p className="text-body-color text-base">
                        {doc.blogText.substr(0, 200) + "...."}
                      </p>
                    </div>
                  </div>
                {/* </div> */}
              </Link>
            </div>);
            })}
          </div>
        </div>
      </section>}

      <div className='flex flex-col items-center w-full h-full justify-center self-center'>
        {blogs.length===0 && <div className="h2 text-dark mb-4 text-3xl font-bold sm:text-4xl md:text-[40px]">Blogs are not Available</div>}
      </div>

    </>
  );
}
