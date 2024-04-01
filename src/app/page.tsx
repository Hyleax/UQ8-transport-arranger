"use client"

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaPlusCircle } from "react-icons/fa";
import { RxCross1 } from "react-icons/rx";
import uq8_transport_data from '../../json_files/UQ8_transport.json'


/**
 * 
 * @returns a functional component that represents the entire manual page
 */
export default function Manual() {

    type member = {
        suburb: string;
        got_car: string;
        name: string; 
    }

    const all_members = Object.entries(uq8_transport_data.UQ8_transport_status).map(([name, info]) => ({ name, ...info })) // convert data from JS object to array 
    const membersWithCar = all_members.filter(member => member.got_car === 'yes') // get only members with cars
    const sortedArrWithoutDrivers = all_members.filter(member => member.got_car === 'no').sort((a, b) => a.suburb.localeCompare(b.suburb)) // get only members without cars, sort them by suburb

    const [UQ8_transport_array, setUQ8_transport_array] = useState<member[]>([...membersWithCar, ...sortedArrWithoutDrivers])
                                                                                    
    const [transportArray, setTransportArray] = useState([1,1,1,1])
    const [addedMembers, setAddedMembers] = useState<string[]>([]) 

    // drag function
    const handleOnDrag = (e: React.DragEvent, content: string) => {
        e.dataTransfer.setData('memberName', content)
    }

  return (
    <main className="flex flex-col items-center">
      <div className="container min-h-screen flex flex-col items-center">
        <h1 className="text-2xl font-semibold p-2 mt-3 font-sans">UQ8 Transport Arranger</h1>

        {/* Main Contet */}
        <div className="flex-1 flex w-full justify-between">
            {/* drop members here **LEFT SIDE***/}
            <div className="flex gap-4 items-center  max-w-[70%] overflow-x-auto ">
                {
                    transportArray?.map((ele, index) => {
                        return(
                            <TransportListEntry 
                                key={index} 
                                setAddedMembers={setAddedMembers}/>
                        )
                    })
                }
                
                
                <AddTransportListEntry setTransportArray={setTransportArray} />
            </div>

            {/*  add and select members here **RIGHT SIDE***/}
            <div className="flex flex-col justify-center items-center w-[400px] gap-2">
                
                <div className="flex justify-between  gap-2 w-full">
                  {/* add new member button */}
                  <button className="bg-emerald-300 hover:bg-emerald-400 px-5 py-3 w-full rounded-xl drop-shadow-lg">Automatically Arrange</button>
                  <button className="bg-blue-300 hover:bg-blue-400 px-5 py-3  rounded-xl drop-shadow-lg ">Export</button>
                </div>
                
                {/* Select Drivers from here */}
                <div className="flex flex-wrap gap-3 border-2 shadow-xl mb-2 
                    rounded-md w-full p-3 overflow-y-auto ">
                    {
                        UQ8_transport_array.filter((x) =>x.got_car === 'yes').map((m) => (
                            <DraggableNameEntry 
                                key={m.name} 
                                handleOnDrag={handleOnDrag} 
                                memberName={m.name}
                                hasCar={m.got_car === 'yes' ? true : false}
                                suburb = {m.suburb}
                                addedMembers = {addedMembers}
                            />
                        ))
                    }
                </div>

                {/* Select Riders from here */}
                <div className="flex flex-wrap gap-3 border-2 shadow-xl 
                    rounded-md w-full p-3 overflow-y-auto h-[30em]">
                    {
                        UQ8_transport_array.filter((x) =>x.got_car === 'no').map((m) => (
                            <DraggableNameEntry 
                                key={m.name} 
                                handleOnDrag={handleOnDrag} 
                                memberName={m.name}
                                hasCar={m.got_car === 'yes' ? true : false}
                                suburb = {m.suburb}
                                addedMembers = {addedMembers}
                            />
                        ))
                    }
                </div>
            </div>
        </div>

      </div>
    </main>
  );
}




/**
 * 
 * @param param0 setAddedMembers
 * @returns a component representing a singular vehicle list that can potentially contain one or more people
 */
const TransportListEntry = ({setAddedMembers}: {
        setAddedMembers: React.Dispatch<React.SetStateAction<string[]>>
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
        className="min-w-[200px] h-[750px] bg-slate-200 
          rounded-md flex flex-col gap-4 shadow-lg items-center py-2 px-3 relative">

            { membersInVehicle.length >= 5 && <h1 className="absolute top-[-30px] text-xl text-red-500">Car is Full</h1> }

        {
            membersInVehicle.map((name, index) => {
                return(
                    <NotDraggableNameEntry 
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
    setTransportArray: React.Dispatch<React.SetStateAction<number[]>>
    }) => {

    return (
      <div 
        onClick={() => setTransportArray(prev => [...prev, 1])}
        className="cursor-pointer min-w-[200px] h-[750px] bg-red-100 hover:bg-red-200 
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
const DraggableNameEntry = ({ handleOnDrag, memberName, hasCar, addedMembers, suburb }: {
    handleOnDrag: (e: React.DragEvent, content: string) => void
    memberName: string
    hasCar: boolean
    addedMembers: string[]
    suburb: string
    }) => {
   
    return(
        <div 
        draggable 
        className= {`${addedMembers.includes(memberName) ? 'pointer-events-none bg-gray-300' : 'bg-purple-200 hover:bg-purple-300'}
            p-3 cursor-pointer w-[172px] h-[50px] text-center rounded-xl relative flex flex-wrap items-center justify-center gap-1`}
        onDragStart={(e) => {
            if (handleOnDrag !== undefined) { handleOnDrag(e as unknown as React.DragEvent, memberName) }
        }}

        >
            { hasCar && <span className="absolute top-0 right-0 pr-1">🚗</span> }

            { memberName } <span className="text-xs italic">({ suburb })</span>
        </div>
    )
}




/**
 * 
 * @param param0 {  memberName, index, setAddedMembers, setMembersInVehicle }
 * @returns a non-draggable component that has been dropped into a TransportListEntry
 */
const NotDraggableNameEntry = ({  memberName, index, setAddedMembers, setMembersInVehicle }: { 
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
        className={`${index === 0 ? "bg-amber-100": "bg-blue-100"} p-3 w-full text-center drop-shadow-lg rounded-xl relative`}

        >
            <span onClick={handleClick} className="absolute top-0 right-0 pr-2 pt-1 hover:text-slate-400 cursor-pointer"><RxCross1 size={18}/></span>   
            
            <p className="pl-2 text-left">{ memberName } <span className="text-xl">{`${index === 0 ? "🚗": ""}`}</span></p>
        </div>
    )
}