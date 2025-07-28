"use client";

// import { SITE_NAME } from '@/config';
// import { Metadata } from 'next';
import React, { ReactNode, useState } from 'react'
import { DraggableTranscriptReminder } from './componenets/ReminderAlart';

// export const metadata: Metadata = {
//    title: `${SITE_NAME} - Student Dashboard`,
//    description: "View your accademic statuses and manage payments",
// };

type LayoutProps = {
   children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
   const [showPopup, setShowPopup] = useState(true);

   const handleClose = () => {
      setShowPopup(false);
      // Auto-show again after 5 seconds for demo purposes
      setTimeout(() => setShowPopup(true), 5000);
   };

   const handleUpload = () => {
      alert('Opening transcript upload page...\n\nIn a real app, this would navigate to your upload form or open a file picker.');
      setShowPopup(false);
   };

   return (
      <div>
         {children}
         {!showPopup && (
            <button
               onClick={() => setShowPopup(true)}
               className="fixed bottom-4 right-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
            >
               Show Reminder
            </button>
         )}
         <DraggableTranscriptReminder
            isVisible={showPopup}
            onClose={handleClose}
            onUploadClick={handleUpload}
            studentName="Alex"
         />
      </div>
   )
}

export default Layout