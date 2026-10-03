import { uploadBlogImage } from './cloudinaryUpload';
import { auth } from '../config/firebaseConfig';
jest.mock('../config/firebaseConfig',()=>({auth:{currentUser:{getIdToken:jest.fn()}}}));
const originalFetch=global.fetch;
const user=auth.currentUser;
const file=()=>new File(['image'],'test.png',{type:'image/png'});
const signed={cloudName:'test',apiKey:'key',signature:'signed',params:{public_id:'oneshot/id',timestamp:123,overwrite:'false',allowed_formats:'jpg,jpeg,png,webp'}};
beforeEach(()=>{global.fetch=jest.fn();auth.currentUser=user;user.getIdToken.mockResolvedValue('firebase-token');});
afterAll(()=>{global.fetch=originalFetch;});
test('uploads to Cloudinary; Firebase token goes only to the backend',async()=>{
 global.fetch.mockResolvedValueOnce({ok:true,json:async()=>signed}).mockResolvedValueOnce({ok:true,json:async()=>({public_id:'oneshot/id',secure_url:'https://res.cloudinary.com/test/image/upload/a.png'})});
 expect(await uploadBlogImage(file())).toBe('https://res.cloudinary.com/test/image/upload/a.png');
 expect(global.fetch.mock.calls[0][0]).toMatch(/\/uploads\/signature$/);
 expect(global.fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer firebase-token');
 const [url,options]=global.fetch.mock.calls[1];
 expect(url).toBe('https://api.cloudinary.com/v1_1/test/image/upload');
 expect(options.headers).toBeUndefined();
 expect(options.body.get('signature')).toBe('signed');
 expect(options.body.get('overwrite')).toBe('false');
 expect(options.body.get('file').name).toBe('test.png');
});
test('rejects unsupported or oversized images before network requests',async()=>{
 await expect(uploadBlogImage(new File(['pdf'],'x.pdf',{type:'application/pdf'}))).rejects.toThrow('JPG');
 await expect(uploadBlogImage({type:'image/png',size:6*1024*1024})).rejects.toThrow('5 MB');
 expect(global.fetch).not.toHaveBeenCalled();
});
test('requires login',async()=>{
 auth.currentUser=null;
 await expect(uploadBlogImage(file())).rejects.toThrow('sign in');
 expect(global.fetch).not.toHaveBeenCalled();
});
test('stops after signature rejection',async()=>{
 global.fetch.mockResolvedValue({ok:false,json:async()=>({message:'Sign in again'})});
 await expect(uploadBlogImage(file())).rejects.toThrow('Sign in again');
 expect(global.fetch).toHaveBeenCalledTimes(1);
});
test('reports Cloudinary errors',async()=>{
 global.fetch.mockResolvedValueOnce({ok:true,json:async()=>signed}).mockResolvedValueOnce({ok:false,json:async()=>({error:{message:'Upload rejected'}})});
 await expect(uploadBlogImage(file())).rejects.toThrow('Upload rejected');
});
