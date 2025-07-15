"use client";

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { baseUrl } from '@/config'
import { PaymentVerificationCard } from './components/PaymentVerificationCard';
import { toast } from 'sonner';
import { usePaymentVerification } from '@/hooks/usePaymentVerification';

const VerifyApplicationPayment = () => {
   const searchParams = useSearchParams();
   const transRef = searchParams.get('transRef');
   const [verificationResult, setVerificationResult] = useState<{
      status: string;
      message: string;
      amount?: number;
      paymentDate?: string;
   } | null>(null);

   const router = useRouter();
   const { mutate: verifyPayment, isPending } = usePaymentVerification();

   useEffect(() => {
      if (!transRef) {
         toast.error('Payment reference is missing');
         router.push('/');
         return;
      }
   }, [transRef, router]);

   const handleVerify = () => {
      if (!transRef) return;

      verifyPayment(
         { transRef },
         {
            onSuccess: (data) => {
               setVerificationResult(data);
            },
         }
      );
   };

   // useEffect(() => {
   //    async function verifyPayment() {
   //       const ref = Array.isArray(transRef) ? transRef[0] : transRef;
   //       setIsLoading(true);
   //       const { error, success } = await verifyApplicationPurchase(String(ref));
   //       if (success) {
   //          setIsLoading(false);
   //          setRefrenceNumber(String(ref));
   //          notify({ message: success.message, variant: "success", timeout: 5000 })
   //       }
   //       if (error) {
   //          setIsLoading(false);
   //          console.log('error', error)
   //          notify({ message: "Something went wrong", variant: "error", timeout: 5000 });
   //       }
   //    }
   //    setIsClient(true);
   //    verifyPayment();
   // }, [transRef, router])

   // const handleCopy = () => {
   //    if (isClient) {
   //       navigator.clipboard.writeText(refrenceNumber);
   //       setCopied(true);
   //       setTimeout(() => {
   //          setCopied(false)
   //       }, 5000)
   //    }
   // }
   const handleRedirect = () => {
      router.push(`${baseUrl}/auth/signin?transRef=${transRef}`);
      router.refresh();
   }

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
      // <div className="container flex items-center justify-center min-h-screen text-black">
      //    <CenteredSection classList='min-h-[450px] w-[50vw] mx-auto p-0' title={''}>
      //       <Banner />
      //       <h1 className='text-2xl my-2'>Verifying your payment</h1>

      //       <div className='flex flex-col items-center justify-center space-y-10'>
      //          {isLoading && <Loader />}
      //          {refrenceNumber &&
      //             (<>
      //                <h3 className="text-orange-600 text-lg -mb-7 mt-5 py-1 px-7 rounded-full border">{refrenceNumber}</h3>
      //                <Button onClick={handleCopy} variant={'default'} className='py-1 rounded-full'>{copied ? "copied" : "click to copy"}</Button>
      //                <div className="w-[60%] mx-auto">
      //                   <Button onClick={handleRedirect} variant={'destructive'} className='w-full'>continue</Button>
      //                </div>
      //             </>)
      //          }
      //       </div>
      //    </CenteredSection>
      // </div>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
         <PaymentVerificationCard
            paymentRef={transRef || ''}
            isVerifying={isPending}
            verificationResult={verificationResult}
            onVerify={handleVerify}
            onProceed={handleRedirect}
         />
      </div>
   )
}

export default VerifyApplicationPayment