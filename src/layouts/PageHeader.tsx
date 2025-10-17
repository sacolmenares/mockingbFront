import logo from "../assets/logowspace.png"

export function PageHeader () {
    return (
        <div className = "flex items-center p-2 border-b border-gray-200 shadow-md z-10">
            <img src={logo} className="h-16 m-0" />
        </div>
    )
}