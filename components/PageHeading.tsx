export default function PageHeading({ children }: { children: React.ReactNode }) {
    return (
        <div className="mb-8">
            <h1 className="font-serif text-4xl tracking-tight">{children}</h1>
        </div>
    );
}
