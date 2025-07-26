import DashboardPage from "./dashboard/page";

export default function Home() {
  // By default, render the dashboard when a user visits the root URL.
  return <DashboardPage />;
}

// 'use client';
// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// // This component will now act as a redirector.
// // It sends new visitors to the login page by default.
// export default function Home() {
//   const router = useRouter();

//   useEffect(() => {
//     // When this page loads, immediately push the user to the login page.
//     router.push('/auth/login');
//   }, [router]);

//   // Render a simple loading state while the redirect happens.
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
//         <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
//     </div>
//   );
// }
