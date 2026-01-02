export default function DashboardCard({ title, value, icon, color = "bg-blue-500" }: { title: string, value: number | string, icon: string, color?: string }) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between transition-all hover:shadow-md hover:translate-y-[-2px]">
            <div>
                <p className="text-gray-500 text-sm font-medium tracking-wide uppercase">{title}</p>
                <p className="text-3xl font-bold text-navy-900 mt-2">{value}</p>
            </div>
            <div className={`w-12 h-12 rounded-full ${color} opacity-10 flex items-center justify-center text-xl`}>
                {/* Revisit if we want to pass actual Lucide icon component or just emoji string for now */}
                <span className="opacity-100">{icon}</span>
            </div>
            {/* 
                Explanation: The color prop is applied as bg color with opacity. 
                If passing 'bg-blue-500', opacity-10 makes it light. 
                We might want the icon itself to have the solid color.
                Let's simplify: User passes a Tailwind color class like 'text-blue-500' or 'bg-blue-500'.
                Actually current usage in page.tsx was passing 'bg-blue-500' and applying it to a div.
                I'll stick to that but refine it.
            */}
        </div>
    );
}
