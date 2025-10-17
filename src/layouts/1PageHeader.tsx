//Page header con barra de busqueda y 4 iconos

import { Bell, CircleUser, Menu, Upload, Mic, Search} from "lucide-react" //Libreria de iconos (npm install lucide-react)
import logo from "../assets/logowspace.png"
import { Button } from "../components/Button"
import { useState } from "react"

export function PageHeader (){
    const [showFullWidthSearch, setShowFullWidthSearch] = useState(false)
   
    return (
    <div className = "flex gap-10 lg:gap-20 justify-between pt-2 mb-6 mx-4">
    <div className={`gap-4 items-center flex-shrink-0 ${
        showFullWidthSearch ? "hidden" : "flex"
    }`}> 
        <Button variant="ghost" size="icon" >
            <Menu />
        </Button>
        <a href="#">
            <img src={logo} className="h-8" />
        </a>
    </div>
    <form className = {`sm:flex hidden flex gap-4 flex-grow justify-center ${showFullWidthSearch ? "hidden" : ""}`}>
        <div className="flex flex-grow max-w-[600px]">   
            <input 
            type = "search" 
            placeholder="Search"
            className="rounded-l-full border border-secondary-border 
            shadow-inner shadow-secondary py-1 px-4 text-lg w-full
            focus:border-blue-500 outline-none"
            />
            <Button variant = "default"className ="py-2 px-4 rounded-r-full border-secondary-border border border-l-0 flex-shrink-0" >
                <Search />
            </Button>
        </div>
    </form>

    {showFullWidthSearch && (
        <form className="flex gap-4 flex-grow justify-center absolute left-0 right-0 top-0 z-10 bg-white border-b">
            <div className="flex flex-grow max-w-[600px]">   
                <input 
                type = "search" 
                placeholder="Search"
                className="rounded-l-full border border-secondary-border 
                shadow-inner shadow-secondary py-1 px-4 text-lg w-full
                focus:border-blue-500 outline-none"
                />
                <Button variant = "default"className ="py-2 px-4 rounded-r-full border-secondary-border border border-l-0 flex-shrink-0" >
                    <Search />
                </Button>
            </div>
            <Button onClick={() => setShowFullWidthSearch(false)} type="button" size="icon" variant="ghost">
                <Menu />
            </Button>
        </form>
    )} 
    <div 
    className = {`flex-shrink-0 md:gap-1.5 ${
        showFullWidthSearch ? "hidden" : "flex"}`}> 
        <Button onClick={() => setShowFullWidthSearch(true)}
         size="icon" variant="ghost" className="sm:hidden md:hidden">
            <Search />
        </Button> 

        <Button type="button" size="icon" variant="ghost" className="flex-shrink-0">
            <Mic />
        </Button>

        <Button size="icon" variant="ghost">
            <Upload />
        </Button>

        <Button size="icon" variant="ghost">
            <Bell />
        </Button>

        <Button size="icon" variant="ghost">
            <CircleUser />
        </Button>
    </div>
    </div>
    )
}

