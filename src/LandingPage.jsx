import React from "react"
import { BsWindow } from 'react-icons/bs'

function LandingPage() {

    return (
        <div class='w-full h-full flex justify-center'>
            <div class='flex flex-col my-[100px] h-[500px] items-center justify-evenly'>
                <div>
                    <h2 class="m-auto text-3xl font-bold mb-4 text-5xl">Simple GIF screen recorder</h2>
                    <p class="text-base font-normal text-neutral-600 text-lg text-center">Made by a <span class='font-bold'>developer</span> for <span class='font-bold'>developers</span>.</p>
                </div>

                <div class='w-[700px] flex flex-row justify-evenly items-center'>
                    <div class='w-[250px] h-[200px] p-[10px] flex flex-col justify-center items-center border-2 rounded-xl bg-blue-100'>
                        {/* Screen Icon */}
                        <BsWindow class='h-4/5 w-full' />

                        {/* Screen Text */}
                        <p>Screen</p>
                    </div>

                    <button
                        class="mt-4 flex h-[72px] w-60 items-center justify-around rounded-xl bg-red-500 text-white hover:bg-red-600 active:bg-red-700"
                    >
                        {/* Recording Text */}
                        <div class='ml-2 tracking-wider'>
                            Start Recording
                        </div>
                        
                        {/* Recording Icon */}
                        <div class="flex h-12 w-12 content-center items-center rounded-full bg-white shadow-md">
                            <div class="mx-auto h-4 w-4 rounded-full bg-red-600 p-0">
                            </div>
                        </div>
                    </button>
                </div>

                <p>No signups, no watermarks, no BS</p>
            </div>
        </div>
    )
}


export default LandingPage
