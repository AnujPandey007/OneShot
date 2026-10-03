import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddPost from './AddPost';
import { uploadBytes } from 'firebase/storage';
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }));
jest.mock('../config/firebaseConfig', () => ({storage:{},auth:{currentUser:{displayName:'Tester',photoURL:'https://example.com/avatar.png'}}}));
jest.mock('../context/userContext', () => ({useUser:()=>({userData:{_id:'test-user'}})}));
jest.mock('../pages/tagApi', () => ({BLOG_TAGS:['Sports'],predictBlogTag:jest.fn()}));
jest.mock('firebase/storage', () => ({ref:jest.fn(),uploadBytes:jest.fn(),getDownloadURL:jest.fn()}));
jest.mock('uuid', () => ({v4:()=> 'id'}));
const originalFetch = global.fetch;
beforeEach(()=>{jest.clearAllMocks();global.fetch=jest.fn();});
afterAll(()=>{global.fetch=originalFetch;});
function form(){
 render(<AddPost isAuth setAlert={jest.fn()} />);
 fireEvent.change(screen.getAllByRole('textbox')[0],{target:{value:'Cricket'}});
 fireEvent.change(screen.getAllByRole('textbox')[1],{target:{value:'The cricket team won the final match.'}});
 fireEvent.change(screen.getByRole('combobox'),{target:{value:'Sports'}});
}
test('publishes without an image and does not call storage',async()=>{
 global.fetch.mockResolvedValue({ok:true,json:async()=>({_id:'saved'})});
 form();fireEvent.click(screen.getByRole('button',{name:'Submit'}));
 await waitFor(()=>expect(mockNavigate).toHaveBeenCalledWith('/'));
 expect(uploadBytes).not.toHaveBeenCalled();
 expect(JSON.parse(global.fetch.mock.calls[0][1].body).blogImage).toBe('');
});
test('server rejection stays on form and shows the error',async()=>{
 global.fetch.mockResolvedValue({ok:false,status:404,json:async()=> 'blogImage is required'});
 form();fireEvent.click(screen.getByRole('button',{name:'Submit'}));
 expect(await screen.findByRole('alert')).toHaveTextContent('blogImage is required');
 expect(mockNavigate).not.toHaveBeenCalled();
 expect(screen.getByRole('button',{name:'Submit'})).toBeEnabled();
});
test('failed optional upload can be bypassed explicitly',async()=>{
 uploadBytes.mockRejectedValue(new Error('storage/unauthorized'));
 global.fetch.mockResolvedValue({ok:true,json:async()=>({_id:'saved'})});
 form();fireEvent.click(screen.getByRole('checkbox'));
 fireEvent.change(screen.getByLabelText('Upload image'),{target:{files:[new File(['x'],'image.png',{type:'image/png'})]}});
 fireEvent.click(screen.getByRole('button',{name:'Submit'}));
 expect(await screen.findByRole('alert')).toHaveTextContent('Image upload failed');
 expect(global.fetch).not.toHaveBeenCalled();
 fireEvent.click(screen.getByRole('checkbox'));
 fireEvent.click(screen.getByRole('button',{name:'Submit'}));
 await waitFor(()=>expect(mockNavigate).toHaveBeenCalledWith('/'));
 expect(JSON.parse(global.fetch.mock.calls[0][1].body).blogImage).toBe('');
});
