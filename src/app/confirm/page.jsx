"use client"

import {CheckCircle, Loader2, Mail} from "lucide-react"
import {Card, CardContent} from "../../components/ui/card";
import {useEffect, useState} from "react";
import UserService from "../../services/UserService";
import {toast} from "sonner";
import {RiErrorWarningFill} from "react-icons/ri";

export default function Component() {
    const [isSuccess, setIsSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const confirm = async () => {
            const email = localStorage.getItem("email");
            if (!email) {
                toast.error("Không tìm thấy email xác thực.");
                return;
            }
            try {
                setLoading(true);
                const response = await UserService.confirmEmail(email);
                setIsSuccess(response.status === 200);
            } catch (error) {
                console.error(error);
                toast.error(error.response?.data?.message || "Xác minh thất bại. Vui lòng thử lại.");
                setIsSuccess(false);
            } finally {
                setLoading(false);
            }
        };
        confirm();
    }, []);


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-purple-900">
                <Loader2 className="h-8 w-8 animate-spin text-white"/>
            </div>
        )
    }

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center p-4">
            <Card className="p-0 w-full max-w-md bg-white shadow-2xl border-0 overflow-hidden">
                <CardContent className="p-0">
                    {/* Header with gradient background */}
                    <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 p-8 text-center">
                        <div className="relative">
                            {/* Success icon with animation */}
                            <div
                                className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg animate-bounce">
                                {isSuccess ? <CheckCircle className="w-10 h-10 text-green-500"/>
                                    : <RiErrorWarningFill className="w-10 h-10 text-red-500"/>}
                            </div>

                            {/* Mail icon decoration */}
                            <div className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-md">
                                <Mail className="w-5 h-5 text-purple-600"/>
                            </div>
                        </div>

                        <h1 className="text-2xl font-bold text-white mb-2">
                            {isSuccess ? "Mở khóa tài khoản thành công" : "Mở khóa tài khoản thất bại"}
                        </h1>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
