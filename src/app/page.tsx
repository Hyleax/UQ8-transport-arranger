"use client"

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaPlusCircle } from "react-icons/fa";
import { RxCross1 } from "react-icons/rx";
import ccm_TD from '../../data/CCM_transport.json'; // import CCM transport data   

// import LG car presets
import { uq8_uni_to_home_preset } from "./Presets"

// components
import NewFriendModal, { member } from "./components/Modal";
import { DragDropContext, Draggable, Droppable, DropResult, Placeholder } from "react-beautiful-dnd";

// VersionBanner Component
// This functional component renders a banner displaying the latest version and its new features.
const VersionBanner = () => {
    return (
        <div className="bg-pink-300 w-full overflow-hidden xl:flex hidden justify-center p-1">
            <div className="whitespace-nowrap animate-[marquee_10s_linear_infinite]">
                <p className="flex gap-2">
                    v3.2 out now 🤩 new features include: 
                    <span className="font-extralight">Allow for absent members to be placed into a separate section for easier organisation</span>
                </p>
            </div>
        </div>
    );
};



/**
 * 
 * @returns a functional component that represents the entire manual method interface of arranging transport
 */
export default function ManualInterface() {
    const [visibleLifegroups, setVisibleLifegroups] = useState<{
        UQ8: boolean,
        UQ6: boolean,
        UQ3: boolean,
    }>({
        UQ8: true,
        UQ6: false,
        UQ3: false,
    });

    const uq8Members = Object.entries(ccm_TD.UQ8_transport_status.members).map(([name, info]) => ({ name, ...info })) as member[];
    const uq6Members = Object.entries(ccm_TD.UQ6_transport_status.members).map(([name, info]) => ({ name, ...info })) as member[];
    const uq3Members = Object.entries(ccm_TD.UQ3_transport_status.members).map(([name, info]) => ({ name, ...info })) as member[];
    const [allMembers, setAllMembers] = useState<member[]>(uq8Members);
    
    
    const [openModal, setOpenModal] = useState<boolean>(false); // state to open and close modal
    const [queryMember, setQueryMember] = useState<string>(""); 
    
    
    // state variables to represent each car column
    const [drivers, setDrivers] = useState<member[]>([]);
    const [nonDrivers, setNonDrivers] = useState<member[]>([]);
    const [car1, setCar1] = useState<member[]>([]);
    const [car2, setCar2] = useState<member[]>([]);
    const [car3, setCar3] = useState<member[]>([]);
    const [car4, setCar4] = useState<member[]>([]);
    const [car5, setCar5] = useState<member[]>([]);
    const [car6, setCar6] = useState<member[]>([]);
    const [absentMembers, setAbsentMembers] = useState<member[]>([])



    // Checkbox change handlers
    const handleCheckboxChange = (group: keyof typeof visibleLifegroups) => {
        setVisibleLifegroups(prev => ({ ...prev, [group]: !prev[group] }));
    };

    useEffect(() => {
        const availableMembers = [
            ...(visibleLifegroups.UQ8 ? uq8Members : []),
            ...(visibleLifegroups.UQ6 ? uq6Members : []),
            ...(visibleLifegroups.UQ3 ? uq3Members : []),
        ];


        const selectedMembers: member[] = [...car1, ...car2, ...car3, ...car4, ...car5, ...car6]

        const remainingMembers = availableMembers.filter(member => !selectedMembers.some(selected => selected.name === member.name))

        setDrivers(remainingMembers.filter(member => member.got_car === 'yes').sort((a, b) => a.suburb.localeCompare(b.suburb)))
        setNonDrivers(remainingMembers.filter(member => member.got_car === 'no').sort((a, b) => a.suburb.localeCompare(b.suburb)))


        setAllMembers(remainingMembers);
    }, [visibleLifegroups]);


    useEffect(() => {
        setDrivers(allMembers.filter(member => member.got_car === 'yes').sort((a, b) => a.suburb.localeCompare(b.suburb)))
        setNonDrivers(allMembers.filter(member => member.got_car === 'no').sort((a, b) => a.suburb.localeCompare(b.suburb)))
    }, [allMembers])


    const handleDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;
    
        // If there is no destination, exit early
        if (!destination) return;
    
        // If moving within the same list but different index, reorder
        if (source.droppableId === destination.droppableId) {
            if (source.index !== destination.index) {
                reorderWithinCar(source.droppableId, source.index, destination.index);
            }
            return;
        }
    
        // Delete the member from its original location
        deletePreviousStateLocal(source.droppableId, draggableId);
    
        // Find the member that was dragged
        const member = findItemById(draggableId, [
            ...car1, ...car2, ...car3, ...car4, ...car5, ...car6, ...drivers, ...nonDrivers, ...absentMembers
        ]);
    
        // Insert the member into the new location
        setNewState(destination.droppableId, member as member, destination.index);
    };
    
    // Function to reorder items within the same car array
    const reorderWithinCar = (droppableId: string, startIndex: number, endIndex: number) => {
        let updatedList;
    
        switch (droppableId) {
            case "1":
                updatedList = reorderList(car1, startIndex, endIndex);
                setCar1(updatedList);
                break;
            case "2":
                updatedList = reorderList(car2, startIndex, endIndex);
                setCar2(updatedList);
                break;
            case "3":
                updatedList = reorderList(car3, startIndex, endIndex);
                setCar3(updatedList);
                break;
            case "4":
                updatedList = reorderList(car4, startIndex, endIndex);
                setCar4(updatedList);
                break;
            case "5":
                updatedList = reorderList(car5, startIndex, endIndex);
                setCar5(updatedList);
                break;
            case "6":
                updatedList = reorderList(car6, startIndex, endIndex);
                setCar6(updatedList);
                break;
            case "drivers":
                updatedList = reorderList(drivers, startIndex, endIndex);
                setDrivers(updatedList);
                break;
            case "nonDrivers":
                updatedList = reorderList(nonDrivers, startIndex, endIndex);
                setNonDrivers(updatedList);
                break;
            case "nonDrivers":
                updatedList = reorderList(absentMembers, startIndex, endIndex);
                setAbsentMembers(updatedList);
                break;
        }
    };
    
    // Helper function to reorder a list
    const reorderList = (list: member[], startIndex: number, endIndex: number): member[] => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1); // Remove the item
        result.splice(endIndex, 0, removed); // Insert it at the new position
        return result;
    };
    
    // Function to remove a member from the given car array
    function removeItemById(memberIdName: string, array: member[]) {
        return array.filter((m) => m.name !== memberIdName);
    }
    
    // Function to insert a member at a specific index
    function insertAt(array: member[], item: member, index: number): member[] {
        const newArray = [...array];
        newArray.splice(index, 0, item);
        return newArray;
    }
    
    // Update the state in the appropriate car or category
    function setNewState(destinationDroppableId: string, member: member, index: number) {
        switch (destinationDroppableId) {
            case "1":
                setCar1(insertAt(car1, member, index));
                break;
            case "2":
                setCar2(insertAt(car2, member, index));
                break;
            case "3":
                setCar3(insertAt(car3, member, index));
                break;
            case "4":
                setCar4(insertAt(car4, member, index));
                break;
            case "5":
                setCar5(insertAt(car5, member, index));
                break;
            case "6":
                setCar6(insertAt(car6, member, index));
                break;
            case "drivers":
                setDrivers(insertAt(drivers, member, index));
                break;
            case "nonDrivers":
                setNonDrivers(insertAt(nonDrivers, member, index));
                break;
            case "absent":
                setAbsentMembers(insertAt(absentMembers, member, index));
                break;
        }
    }
    
    // Find a member by its ID from a given array
    function findItemById(memberIdName: string, array: member[]) {
        return array.find((m) => m.name === memberIdName);
    }
    
    // Delete the previous state for the given member from the source droppable list
    function deletePreviousStateLocal(sourceDroppableId: string, memberIdName: string) {
        switch (sourceDroppableId) {
            case "1":
                setCar1(removeItemById(memberIdName, car1));
                break;
            case "2":
                setCar2(removeItemById(memberIdName, car2));
                break;
            case "3":
                setCar3(removeItemById(memberIdName, car3));
                break;
            case "4":
                setCar4(removeItemById(memberIdName, car4));
                break;
            case "5":
                setCar5(removeItemById(memberIdName, car5));
                break;
            case "6":
                setCar6(removeItemById(memberIdName, car6));
                break;
            case "drivers":
                setDrivers(removeItemById(memberIdName, drivers));
                break;
            case "nonDrivers":
                setNonDrivers(removeItemById(memberIdName, nonDrivers));
                break;
            case "absent":
                setAbsentMembers(removeItemById(memberIdName, absentMembers))
                break;
        }
    }
    
    
    
    
    function deletePreviousState(sourceDroppableId: string, memberIdName: string, suburb: string, hasCar: boolean) {

        switch (sourceDroppableId) {
            case "1":
                setCar1(removeItemById(memberIdName, car1));
                repopulateSelectionArea()
                break;
            case "2":
                setCar2(removeItemById(memberIdName, car2));
                repopulateSelectionArea()
                break;
            case "3":
                setCar3(removeItemById(memberIdName, car3));
                repopulateSelectionArea()
                break;
            case "4":
                setCar4(removeItemById(memberIdName, car4));
                repopulateSelectionArea()
                break;
            case "5":
                setCar5(removeItemById(memberIdName, car5));
                repopulateSelectionArea()
                break;
            case "6":
                setCar6(removeItemById(memberIdName, car6));
                repopulateSelectionArea()
                break;              
            case "drivers":
                setDrivers(removeItemById(memberIdName, drivers));
                setAbsentMembers(prev => ([...prev, 
                    {
                        name: memberIdName, 
                        suburb: suburb,
                        got_car: hasCar ? 'yes': 'no'
                    } as member
                ]))
                break;
            case "nonDrivers":
                setNonDrivers(removeItemById(memberIdName, nonDrivers));
                setAbsentMembers(prev => ([...prev, 
                    {
                        name: memberIdName, 
                        suburb: suburb,
                        got_car: hasCar ? 'yes': 'no'
                    } as member
                ]))
                break;
            case "absent":
                setAbsentMembers(removeItemById(memberIdName, absentMembers))
                repopulateSelectionArea()
                break;
        }

        function repopulateSelectionArea() {
            if (hasCar) {
                setDrivers(prev => [...prev, {suburb: suburb, name: memberIdName, got_car: hasCar ? 'yes' : 'no'} as member].sort((a, b) => a.suburb.localeCompare(b.suburb)))
            } else {
                setNonDrivers(prev => [...prev, {suburb: suburb, name: memberIdName, got_car: hasCar ? 'yes' : 'no'} as member].sort((a, b) => a.suburb.localeCompare(b.suburb)))

            }
        }

    }

    const [dropdownState, setDropdownState] = useState(false)
    const selectPreset = () => {
        setDropdownState(false)

        /**
             * resets all the fields in all car columns as well as everyone in the "absent members" row
         */
        function resetAllFields() {
            setCar1([])
            setCar2([])
            setCar3([])
            setCar4([])
            setCar5([])
            setCar6([])
            setAbsentMembers([])
        }

        resetAllFields()

        

        // set vehicle states for preset
        setCar1(uq8_uni_to_home_preset['car1'])
        setCar2(uq8_uni_to_home_preset['car2'])
        setCar3(uq8_uni_to_home_preset['car3'])
        setCar4(uq8_uni_to_home_preset['car4'])

        const selectedMembers: member[] = [...uq8_uni_to_home_preset['car1'], ...uq8_uni_to_home_preset['car2'], ...uq8_uni_to_home_preset['car3'], ...uq8_uni_to_home_preset['car4']]

        const remainingMembers = allMembers.filter(member => !selectedMembers.some(selected => selected.name === member.name))

        setDrivers(remainingMembers.filter(member => member.got_car === 'yes').sort((a, b) => a.suburb.localeCompare(b.suburb)))
        setNonDrivers(remainingMembers.filter(member => member.got_car === 'no').sort((a, b) => a.suburb.localeCompare(b.suburb)))
    }


   

    return (
        <main className="flex flex-col items-center">
            
            {/* version update information */}
            <VersionBanner/>

            <div className="container h-screen flex flex-col items-center">
                <h1 className="text-2xl p-2 mt-2 xl:block hidden">CCM Transport Arranger</h1>

                {/* Select Lifegroup */}
                <div className="w-full flex justify-center items-center gap-4 font-extralight">
                    <p className="text-xl xl:block hidden">Lifegroup Members:</p>
                    <label className="flex items-center gap-1 xl:text-xl text-xs cursor-pointer ">
                        <span>UQ8</span>
                        <input 
                            type="checkbox" 
                            checked={visibleLifegroups.UQ8} 
                            onChange={() => handleCheckboxChange('UQ8')} 
                        />
                    </label>
                    <label className="flex items-center gap-1 xl:text-xl text-xs cursor-pointer">
                        <span>UQ6</span>
                        <input 
                            type="checkbox" 
                            checked={visibleLifegroups.UQ6} 
                            onChange={() => handleCheckboxChange('UQ6')} 
                        />
                    </label>
                    <label className="flex items-center gap-1 xl:text-xl text-xs cursor-pointer">
                        <span>UQ3</span>
                        <input 
                            type="checkbox" 
                            checked={visibleLifegroups.UQ3} 
                            onChange={() => handleCheckboxChange('UQ3')} 
                        />
                    </label>

                    <div className="relative w-[180px]">
                        <button 
                            onClick={() => setDropdownState(prev => !prev)} 
                            className="font-light text-blue-500 xl:bg-slate-100 
                                hover:bg-slate-300 p-2 xl:shadow-lg rounded-lg w-full xl:text-base text-xs">Select presets</button>
                        {
                         dropdownState &&
                         
                         <div className="absolute z-20 mt-2 w-full bg-white border border-gray-300 rounded-xl shadow-lg"> 
                            <ul> 
                                <li onClick={selectPreset} className=" px-4 py-2 hover:bg-gray-100 cursor-pointer">UQ8 Uni to Home</li> 
                            </ul>
                        </div>
                        }
                    </div>
                </div>

                {/* Main Content */}
                <DragDropContext onDragEnd={handleDragEnd}>

                    <div className="flex-1 flex w-full justify-between">
                        {/* drop members here **LEFT SIDE** */}
                        <div className="flex flex-col gap-10 justify-center max-w-[70%]">
                            <div className="flex gap-4  items-center  overflow-x-auto ">
                                <CarColumn passengers={car1} id={"1"} deletePreviousState={deletePreviousState}/>
                                <CarColumn passengers={car2} id={"2"} deletePreviousState={deletePreviousState}/>
                                <CarColumn passengers={car3} id={"3"} deletePreviousState={deletePreviousState}/>
                                <CarColumn passengers={car4} id={"4"} deletePreviousState={deletePreviousState}/>
                                <CarColumn passengers={car5} id={"5"} deletePreviousState={deletePreviousState}/>
                                <CarColumn passengers={car6} id={"6"} deletePreviousState={deletePreviousState}/>
                            </div>
                            
                            <div className=" h-[180px] overflow-y-auto flex flex-col gap-2 bg-gray-300 rounded-lg shadow-lg">
                                <p className="text-xl text-center p-1 underline ">Absent Members</p>
                                
                                <Droppable droppableId={"absent"} >
                                    {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                    className={`p-1 transition-colors duration-200  flex flex-grow flex-wrap gap-3 min-h-[100px]${
                                                snapshot.isDraggingOver ? 'bg-blue-200' : ''
                                            }`}
                                            >
                                                <div className="flex flex-wrap  gap-3">
                                                    {absentMembers
                                                    .filter(member => member.name.toLowerCase().includes(queryMember.toLowerCase()))
                                                    .map((p, index) => (
                                                        <PassengerEntry
                                                            key={p.name}
                                                            memberName={p.name} 
                                                            hasCar={p.got_car === 'yes' ? true : false} 
                                                            suburb={p.suburb} 
                                                            index={index}
                                                            dropId={'absent'}
                                                            deletePreviousState={deletePreviousState}
                                                        />
                                                    ))}
                                                </div>
                                                {provided.placeholder}
                                            </div>
                                        )}
                                </Droppable>
                            </div>
                        </div>

                        {/* add and select members here **RIGHT SIDE** */}
                        <div className="flex flex-col xl:justify-center items-center w-[400px] gap-2">
                            <div className="xl:flex hidden justify-between gap-2 w-full">
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
                                className=" border-2 border-slate-300 shadow-xl rounded-lg w-full hidden" 
                                placeholder="Search for Lifegroup members..."
                                value={queryMember}
                                onChange={(e) => setQueryMember(e.target.value) }
                                />

                            {/* Select Drivers from here */}
                            <div className="flex flex-wrap border-2 shadow-xl mb-2 rounded-lg w-full p-3 overflow-y-auto xl:h-[16em] max-h-[16em]">
                                <Droppable droppableId={"drivers"}>
                                    {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                    className={`p-1 transition-colors duration-200  flex flex-grow flex-wrap gap-3 min-h-[100px]${
                                                snapshot.isDraggingOver ? 'bg-blue-200' : ''
                                            }`}
                                            >
                                                {drivers
                                                .filter(member => member.name.toLowerCase().includes(queryMember.toLowerCase()))
                                                .map((p, index) => (
                                                    <PassengerEntry
                                                        key={p.name}
                                                        memberName={p.name} 
                                                        hasCar={p.got_car === 'yes' ? true : false} 
                                                        suburb={p.suburb} 
                                                        index={index}
                                                        dropId={'drivers'}
                                                        deletePreviousState={deletePreviousState}
                                                    />
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                </Droppable>
                            </div>

                            {/* Select Riders from here */}
                            <div className="flex flex-wrap gap-3 border-2 shadow-xl rounded-lg w-full p-3 overflow-y-auto xl:h-[24em] max-h-[24em]">
                                <Droppable droppableId={"nonDrivers"}>
                                        {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.droppableProps}
                                                        className={`p-1 transition-colors duration-200  flex flex-grow flex-wrap gap-3 min-h-[100px]${
                                                    snapshot.isDraggingOver ? 'bg-blue-200' : ''
                                                }`}
                                                >
                                                    {nonDrivers
                                                    .filter(member => member.name.toLowerCase().includes(queryMember.toLowerCase()))
                                                    .map((p, index) => (
                                                        <PassengerEntry
                                                            key={p.name}
                                                            memberName={p.name} 
                                                            hasCar={p.got_car === 'yes' ? true : false} 
                                                            suburb={p.suburb} 
                                                            index={index}
                                                            dropId={'nonDrivers'}
                                                            deletePreviousState={deletePreviousState}
                                                        />
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                    </Droppable>
                            </div>
                        </div>
                    </div>
                </DragDropContext>


                <h1 className="text-sm p-2 mt-3 font-sans font-extralight">Developed by Norman Yap © 2024 for Life Group purposes within CCM & Hope Church</h1>
            </div>
        </main>
    );
}






const CarColumn = ({ passengers, id, deletePreviousState }: {
    passengers: member[]
    id: string
    deletePreviousState(sourceDroppableId: string, memberIdName: string, suburb: string, hasCar: boolean): void
}) => {
    // Determine the background color class based on passengers count
    const isFull = passengers.length === 5;
    const isExceeded = passengers.length > 5;
    const bgColorClass = isExceeded ? 'bg-red-500' : (isFull ? 'bg-red-300' : 'bg-slate-200');

    return (
        <div className={`w-[165px] h-[400px] ${bgColorClass} rounded-lg flex flex-col gap-4 shadow-lg items-center relative`}>
            <Droppable droppableId={id}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`p-1 rounded-lg transition-colors duration-200 gap-5 flex flex-col flex-grow h-full ${
                            snapshot.isDraggingOver ? 'bg-slate-300 h-full' : ''
                        }`}
                    >
                        {passengers.map((p, index) => (
                            <PassengerEntry
                                key={p.name}
                                memberName={p.name}
                                hasCar={p.got_car === 'yes'}
                                suburb={p.suburb}
                                index={index}
                                dropId={id}
                                deletePreviousState={deletePreviousState}
                            />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>

        </div>
    );
};




const PassengerEntry = ({ memberName, hasCar, suburb , index, dropId, deletePreviousState }: {
    memberName: string
    hasCar: boolean
    suburb: string
    index: number
    dropId: string
    deletePreviousState(sourceDroppableId: string, memberIdName: string, suburb: string, hasCar: boolean): void
}) => {
   

    return(
        <Draggable draggableId={`${memberName}`} key={memberName} index={index}>
        {(provided, snapshot) => (
            <div
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                ref={provided.innerRef}
                className={`hover:bg-emerald-600 hover:text-white transition-colors duration-300 
                    xl:p-3 p-1 cursor-pointer xl:w-[150px] w-[70px] h-[50px] text-center rounded-xl relative flex flex-wrap 
                    items-center xl:justify-center gap-1 shadow-lg 
                    ${
                      dropId === 'absent' 
                        ? 'bg-slate-400 hover:bg-slate-600' 
                        : dropId === 'drivers' || dropId === 'nonDrivers' 
                          ? 'bg-emerald-400' 
                          : index === 0 
                            ? 'bg-blue-400' 
                            : 'bg-yellow-200'
                    }`}
                
            >
            <span className="absolute top-1 right-1 border border-black rounded-full">
                    <RxCross1
                    onClick={() => deletePreviousState(dropId, memberName, suburb, hasCar)}
                        className=" hover:bg-slate-600 hover:text-white rounded-full cursor-pointer"
                        size={15}
                    />
                </span>

                 { (dropId === 'drivers' || dropId === "nonDrivers") && hasCar && <span className="absolute bottom-0 right-0 pr-1 ">🚗 </span>  } 

                { (dropId !== 'drivers' && dropId !== "nonDrivers" && index === 0) && <span className="absolute bottom-0 right-0 pr-1 ">🚗 </span> }   


                <p className="xl:text-xs text-[8px] font-bold text-left w-full">{ memberName } <span className="xl:text-xs text-[7px] italic font-extralight">({ suburb })</span></p>
            </div>
        )}
        </Draggable>
    )

}






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
            rounded-lg flex flex-col gap-2 justify-center items-center drop-shadow-lg">
            <FaPlusCircle 
                size={60} 
            />
      </div>
    )
  }


