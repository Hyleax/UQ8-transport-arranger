
"use client";

import { Modal, TextInput, Checkbox, Label } from "flowbite-react";
import { useEffect, useState } from "react";


export type member = {
  suburb: string;
  got_car: string;
  name: string; 
}

const NewFriendModal = ({openModal, setOpenModal, setUQ8_transport_array}: {

  
  openModal: boolean
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>
  setUQ8_transport_array: React.Dispatch<React.SetStateAction<member[]>>

}) => {

  const [newFriendArr, setNewFriendArr] = useState<member[]>([])

  const handleAdd = () => {
    setUQ8_transport_array(prev => [...prev, ...newFriendArr.filter(x => x.name !== "" || x.suburb !== "")])
    setOpenModal(false)
  }

  return (
    <>
      <Modal show={openModal} onClose={() => setOpenModal(false)}>
        <Modal.Header>Add New Friend</Modal.Header>
        <Modal.Body className="">
          <div className="flex flex-col gap-2">
            {
                newFriendArr.map((x, index) => (
                  <NewFriendEntry 
                    key={index} 
                    setNewFriendArr={setNewFriendArr}
                    index = {index}/>
                ))
            }
          </div>

          {/* add new friend button */}
          <button 
            onClick={() => setNewFriendArr(prev => [...prev, {
              name: "",
              suburb: "",
              got_car: "",      
            }])} 
            className="mt-4 bg-emerald-500 p-3 rounded-lg w-full hover:bg-emerald-600">Create Entry</button>

          
        </Modal.Body>
        <Modal.Footer className="flex">
          <TextInput placeholder="admin string (required if adding permanent members)" className="flex-1" type="password"/>
          
          <div className="flex gap-1">
            <button className="bg-blue-200 px-3 py-2 rounded-lg" onClick={handleAdd}>Add</button>
            <button className="bg-red-200 px-3 py-2 rounded-lg" onClick={() => {
              setOpenModal(false) 
              setNewFriendArr([])
             }}>Cancel</button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}
export default NewFriendModal



const NewFriendEntry = ({ setNewFriendArr, index }: {
  setNewFriendArr: React.Dispatch<React.SetStateAction<member[]>>
  index: number
}) => {
  
  const [newFriendInfo, setNewFriendInfo] = useState<member>({
    name: "",
    suburb: "",
    got_car: "no",
  })


  const handleCanDriveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    const updatedValue = isChecked ? "yes" : "no";
    setNewFriendInfo(prevState => ({
      ...prevState,
      got_car: updatedValue
    }));
  };

  useEffect(() => {
    setNewFriendArr(prev => {
      prev[index] = newFriendInfo;
      let newArr = prev;
      return newArr;
    });
  }, [newFriendInfo]);

  return (
    <div className="flex justify-around items-center gap-1">
      <TextInput placeholder="Name" onChange={(e) => setNewFriendInfo(prevState => ({
        ...prevState,
        name: e.target.value
      }))} 
      value={newFriendInfo.name}/>
      <TextInput placeholder="Suburb" onChange={(e) => setNewFriendInfo(prevState => ({
        ...prevState,
        suburb: e.target.value
      }))} 
      value={newFriendInfo.suburb}/>
      <div className="flex flex-col items-center gap-1 ">
        <Checkbox id="can_drive" className="cursor-pointer" onChange={handleCanDriveChange}/>
        <Label htmlFor="can_drive" className="cursor-pointer">Can Drive</Label>
      </div>
      <div className="flex flex-col items-center gap-1 ">
        <Checkbox id="is_regular" className="cursor-pointer"/>
        <Label htmlFor="is_regular" className="cursor-pointer">Regular</Label>
      </div>
    </div>
  );
};



