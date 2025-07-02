import { Suspense } from 'react'
import RecoverPassword from "../../components/RecoverPassword";

export default function Page() {
    return (
        <Suspense fallback={<div>Đang tải...</div>}>
            <RecoverPassword />
        </Suspense>
    )
}
