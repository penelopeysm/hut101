export default function ErrorMessage({ message }: { message: string }) {
    return (
        <div role="alert" className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm rounded-md px-4 py-3">
            {message}
        </div>
    );
}
