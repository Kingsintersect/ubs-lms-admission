"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";
import { VerifyAcceptanceFeePayment } from "@/app/actions/student";
import { baseUrl } from "@/config";
import Loader from "@/components/application/Loader";;
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const VerifyAcceptance = () => {
   const searchParams = useSearchParams();

   const transRef = searchParams.get('transRef');
   const transAmount = searchParams.get('transAmount');
   const currency = searchParams.get('currency');

   const router = useRouter();
   const [isLoading, setIsLoading] = useState(false);
   const { showToast } = useToast();
   const { access_token } = useAuth();

   useEffect(() => {
      async function verifyPayment(access: string, ref: string) {
         setIsLoading(true);
         const { error, success } = await VerifyAcceptanceFeePayment(access, ref);
         if (success) {
            setIsLoading(false);
            showToast({
               description: success.message,
               variant: 'success',
            }, 10000);
            router.push(`${baseUrl}/dashboard/student/tuition`);
            router.refresh();
         }
         if (error) {
            setIsLoading(false);
            console.log('error', error);
            showToast({
               description: 'Something went wrong!',
               variant: 'error',
            }, 10000);
         }
      }
      if (transRef && access_token) {
         const ref = Array.isArray(transRef) ? transRef[0] : transRef;
         verifyPayment(access_token, ref);
      }
   }, [transRef, access_token, router, showToast])

   if (!transRef) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
               <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Request</h1>
               <p className="text-gray-600">Payment reference is required</p>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
         <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
               <CardTitle>Payment Verification</CardTitle>
               <CardDescription>
                  Verifying your Acceptance fee payment to complete the process
               </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Payment Reference</p>
                  <p className="font-mono text-lg font-semibold bg-gray-100 p-2 rounded">
                     {transRef}
                  </p>
               </div>
               <div className='flex flex-col items-center justify-center space-y-10'>
                  {isLoading && <Loader />}
                  {transRef &&
                     (<div className='w-full py-10 px-20 space-y-5'>
                        <div className="flex justify-between items-center">
                           <div className='text-xl font-bold text-orange-900'>Transaction Ref</div>       <div>{transRef}</div>
                        </div>
                        <div className="flex justify-between items-center">
                           <div className='text-xl font-bold text-orange-900'>Transaction Amount</div>    <div>{transAmount && transAmount}</div>
                        </div>
                        <div className="flex justify-between items-center">
                           <div className='text-xl font-bold text-orange-900'>Currency</div>              <div>{currency && currency}</div>
                        </div>
                     </div>)
                  }
               </div>
            </CardContent>
         </Card>
      </div>
   )
}
export default VerifyAcceptance;
