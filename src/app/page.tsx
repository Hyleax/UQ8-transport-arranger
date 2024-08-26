"use client"

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaPlusCircle } from "react-icons/fa";
import { RxCross1 } from "react-icons/rx";
import ccm_TD from '../../json_files/CCM_transport.json'; // import CCM transport data   

// components
import NewFriendModal, { member } from "./components/Modal";

/**
 * 
 * @returns a functional component that represents the entire manual method interface of arranging transport
 */
export default function ManualInterface() {
    const [visibleLifegroups, setVisibleLifegroups] = useState<{
        UQ8: boolean,
        UQ6: boolean,
    }>({
        UQ8: true,
        UQ6: false,
    });

    const uq8Members = Object.entries(ccm_TD.UQ8_transport_status.members).map(([name, info]) => ({ name, ...info })) as member[];
    const uq6Members = Object.entries(ccm_TD.UQ6_transport_status.members).map(([name, info]) => ({ name, ...info })) as member[];
    
    const [allMembers, setAllMembers] = useState<member[]>(uq8Members);
    
    const membersWithCar = allMembers.filter(member => member.got_car === 'yes');
    const sortedArrWithoutDrivers = allMembers.filter(member => member.got_car === 'no').sort((a, b) => a.suburb.localeCompare(b.suburb));
    
    const [transportArray, setTransportArray] = useState<member[]>([{} as member, {} as member, {} as member, {} as member, {} as member]); // Initialize with 4 empty blocks
    const [addedMembers, setAddedMembers] = useState<string[]>([]);
    const [openModal, setOpenModal] = useState<boolean>(false); // state to open and close modal
    const [queryMember, setQueryMember] = useState<string>(""); // state to open and close modal



    // Checkbox change handlers
    const handleCheckboxChange = (group: keyof typeof visibleLifegroups) => {
        setVisibleLifegroups(prev => ({ ...prev, [group]: !prev[group] }));
    };

    useEffect(() => {
        const selectedMembers = [
            ...(visibleLifegroups.UQ8 ? uq8Members : []),
            ...(visibleLifegroups.UQ6 ? uq6Members : [])
        ];
        setAllMembers(selectedMembers);
    }, [visibleLifegroups]);

    // drag function
    const handleOnDrag = (e: React.DragEvent<HTMLDivElement>, content: string) => {
        e.dataTransfer.setData('memberName', content);
    };

    // remove transport list entry
    const removeTransportListEntry = (id: number) => {
        setTransportArray(prev => prev.filter((_, index) => index !== id));
    };

    const removeMemberFromOptions = (member_name: string) => {
        setAllMembers(prev => [...prev].filter((x) => x.name !== member_name))
    }

    return (
        <main className="flex flex-col items-center">
            
            {/* version update information */}
            <div className="bg-green-300 w-full flex justify-center p-1">
                <p> v2 out now 🤩 new features include: <span className="font-extralight">adding of UQ6 members, changing Between Lifegroups </span> </p>
            </div>

            <div className="container h-screen flex flex-col items-center">
                <h1 className="text-2xl p-2 mt-2">CCM Transport Arranger</h1>

                {/* Select Lifegroup */}
                <div className="w-full flex justify-center items-center gap-4 font-extralight">
                    <p className="text-xl">Lifegroups:</p>
                    <label className="flex items-center gap-1 text-xl cursor-pointer">
                        <span>UQ8</span>
                        <input 
                            type="checkbox" 
                            checked={visibleLifegroups.UQ8} 
                            onChange={() => handleCheckboxChange('UQ8')} 
                        />
                    </label>
                    <label className="flex items-center gap-1 text-xl cursor-pointer">
                        <span>UQ6</span>
                        <input 
                            type="checkbox" 
                            checked={visibleLifegroups.UQ6} 
                            onChange={() => handleCheckboxChange('UQ6')} 
                        />
                    </label>
                    <p className="font-light text-blue-500">Select lifegroups to view members</p>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex w-full justify-between">
                    {/* drop members here **LEFT SIDE** */}
                    <div className="flex gap-4 items-center max-w-[70%] overflow-x-auto">
                        {transportArray?.map((_, index) => (
                            <TransportListEntry 
                                key={index} 
                                number={index} 
                                setAddedMembers={setAddedMembers} 
                                removeTransportListEntry={removeTransportListEntry} 
                            />
                        ))}
                        <AddTransportListEntry setTransportArray={setTransportArray} />
                    </div>

                    {/* add and select members here **RIGHT SIDE** */}
                    <div className="flex flex-col justify-center items-center w-[400px] gap-2">
                        <div className="flex justify-between gap-2 w-full">
                            {/* add temp member button */}
                            <button onClick={() => setOpenModal(prev => !prev)} className="bg-red-100 hover:bg-red-200 px-5 py-3 rounded-xl drop-shadow-lg text-sm">
                                Add New Friend
                            </button>

                            <NewFriendModal 
                                openModal={openModal} 
                                setOpenModal={setOpenModal} 
                                setUQ8_transport_array={setAllMembers} 
                            />

                            <button className="bg-blue-200  px-5 py-3 rounded-xl drop-shadow-lg text-sm opacity-40" disabled>
                                Automatically Arrange Transport
                            </button>
                            <button className="bg-emerald-300 px-5 py-3 rounded-xl drop-shadow-lg text-sm opacity-40" disabled>
                                Export Format
                            </button>
                        </div>

                        <input 
                            type="text" 
                            className=" border-2 border-slate-300 shadow-xl rounded-md w-full" 
                            placeholder="Search for Lifegroup members..."
                            value={queryMember}
                            onChange={(e) => setQueryMember(e.target.value) }
                            />

                        {/* Select Drivers from here */}
                        <div className="flex flex-wrap gap-3 border-2 shadow-xl mb-2 rounded-md w-full p-3 overflow-y-auto h-[16em]">
                            {allMembers
                                .filter(member => member.got_car === 'yes')
                                .filter(member => member.name.toLowerCase().includes(queryMember.toLowerCase()))
                                .map(member => (
                                <DraggableNameEntry 
                                    key={member.name} 
                                    handleOnDrag={handleOnDrag} 
                                    memberName={member.name} 
                                    hasCar={true} 
                                    suburb={member.suburb} 
                                    addedMembers={addedMembers} 
                                    removeMemberFromOptions ={removeMemberFromOptions}
                                />
                            ))}
                        </div>

                        {/* Select Riders from here */}
                        <div className="flex flex-wrap gap-3 border-2 shadow-xl rounded-md w-full p-3 overflow-y-auto h-[24em]">
                            {allMembers
                                .filter(member => member.got_car === 'no')
                                .filter(member => member.name.toLowerCase().includes(queryMember.toLowerCase()))
                                .map(member => (
                                <DraggableNameEntry 
                                    key={member.name} 
                                    handleOnDrag={handleOnDrag} 
                                    memberName={member.name} 
                                    hasCar={false} 
                                    suburb={member.suburb} 
                                    addedMembers={addedMembers} 
                                    removeMemberFromOptions={removeMemberFromOptions}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <h1 className="text-sm p-2 mt-3 font-sans font-extralight">Developed by Norman (UQ8) 2024</h1>
            </div>
        </main>
    );
}












/**
 * 
 * @param param0 setAddedMembers
 * @returns a component representing a singular vehicle list that can potentially contain one or more people
 */
const TransportListEntry = ({setAddedMembers, number, removeTransportListEntry}: {
        setAddedMembers: React.Dispatch<React.SetStateAction<string[]>>
        number: number
        removeTransportListEntry: (id: number) => void
    }) => {

    const [membersInVehicle, setMembersInVehicle] = useState<string []>([])

    const handleOnDrop = (e: React.DragEvent) => {
        const memberName = e.dataTransfer.getData('memberName') as string
        if (membersInVehicle.length < 5) {
            setMembersInVehicle(prev => [...prev, memberName])
            setAddedMembers(prev => [...prev, memberName])
        }
    }


    return (
      <div 
        onDrop={(e) => {
        if (handleOnDrop !== undefined) { handleOnDrop(e) }
        }} 
        onDragOver={(e) => e.preventDefault()}
        className="min-w-[165px] h-[770px] bg-slate-200 
          rounded-md flex flex-col gap-4 shadow-lg items-center py-2 px-3 relative">

            { membersInVehicle.length >= 5 && <h1 className="absolute top-[-30px] text-xl text-red-500">Car is Full</h1> }

            {
              number === 9999 &&

              <button 
                onClick={() => removeTransportListEntry(number)}
                className="absolute bottom-3 bg-red-700 hover:bg-red-800 p-2 w-[80%] rounded-lg text-white shadow-lg text-xs">remove
              </button>
            }

        {
            membersInVehicle.map((name, index) => {
                return(
                    <InListDraggableNameEntry 
                        key={name} 
                        memberName={name} 
                        index={index} 
                        setAddedMembers={setAddedMembers}
                        setMembersInVehicle={setMembersInVehicle}
                        />
                )
            })
        }
      </div>
    );
  };
  



/**
 * 
 * @param param0 setTransportArray
 * @returns a component that allows the user to initialize a new TransportListEntry component
 */
const AddTransportListEntry = ({setTransportArray}: {
    setTransportArray: React.Dispatch<React.SetStateAction<member[]>>
    }) => {

    return (
      <div 
        onClick={() => setTransportArray(prev => [...prev, {} as member ])}
        className="cursor-pointer min-w-[165px] h-[770px] bg-red-100 hover:bg-red-300 transition-colors duration-300
            rounded-md flex flex-col gap-2 justify-center items-center drop-shadow-md">
            <FaPlusCircle 
                size={60} 
            />
      </div>
    )
  }




/**
 * 
 * @param param0 { handleOnDrag, memberName, hasCar, addedMembers, suburb }
 * @returns a Draggable component that can be dragged and dropped to add a person to a TransportListEntry
 */
const DraggableNameEntry = ({ handleOnDrag, memberName, hasCar, addedMembers, suburb, removeMemberFromOptions }: {
    handleOnDrag: (e: React.DragEvent<HTMLDivElement>, content: string) => void
    memberName: string
    hasCar: boolean
    addedMembers: string[]
    suburb: string
    removeMemberFromOptions: (member_name: string) => void
    }) => {
   
    return(
        <div 
        draggable 
        className= {`${addedMembers.includes(memberName) ? 'pointer-events-none opacity-25' : 'hover:bg-purple-400 hover:text-white  transition-colors duration-300'}
            p-3 cursor-pointer w-[150px] h-[50px] text-center rounded-xl relative flex flex-wrap items-center justify-center gap-1 shadow-md bg-purple-200`}
        onDragStart={(e) => {
            if (handleOnDrag !== undefined) { handleOnDrag(e as unknown as React.DragEvent<HTMLDivElement>, memberName) }
        }}

        >
            <span className="absolute top-1 right-1 border border-black rounded-full">
                <RxCross1
                    className="hover:text-black hover:bg-red-200 rounded-full"
                    size={12}
                    onClick={() => removeMemberFromOptions(memberName)}
                />
            </span>

            { hasCar && <span className="absolute bottom-0 right-0 pr-1">🚗</span> }

            <p className="text-xs font-bold text-left w-full">{ memberName } <span className="text-xs italic font-extralight">({ suburb })</span></p>
        </div>
    )
}




/**
 * 
 * @param param0 {  memberName, index, setAddedMembers, setMembersInVehicle }
 * @returns a non-draggable component that has been dropped into a TransportListEntry
 */
const InListDraggableNameEntry = ({  memberName, index, setAddedMembers, setMembersInVehicle }: { 
    memberName: string 
    index: number
    setAddedMembers: React.Dispatch<React.SetStateAction<string[]>>
    setMembersInVehicle: React.Dispatch<React.SetStateAction<string[]>>
    }) => {

    const handleClick = () => {
        setAddedMembers(prev => [...prev].filter((p) => p !== memberName))
        setMembersInVehicle(prev => [...prev].filter((p) => p !== memberName))
    }

    return(
        <div 
        draggable
        className={`${index === 0 ? "bg-amber-100": "bg-blue-100"} p-3 w-full text-center drop-shadow-lg rounded-xl relative`}

        >
            <span onClick={handleClick} className="absolute top-0 right-0 pr-2 pt-1 hover:text-slate-400 cursor-pointer"><RxCross1 size={10}/></span>   
            
            <p className="pl-2 text-left text-sm">{ memberName } <span className="text-xs">{`${index === 0 ? "🚗": ""}`}</span></p>
        </div>
    )
}