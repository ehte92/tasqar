interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="text-center text-red-600 p-4 bg-red-50 rounded-md">
      {message}
    </div>
  );
}
