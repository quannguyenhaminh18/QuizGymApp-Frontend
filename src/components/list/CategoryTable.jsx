"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardHeader } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Separator } from "../ui/separator"
import { Pencil, Plus, Search, FileText, ListCheck, Loader2 } from "lucide-react"
import CategoryService from "../../services/CategoryService"
import { Skeleton } from "../ui/skeleton"
import DeleteButton from "../alerts-confirms/DeleleButton"
import {cn} from "../../lib/utils";

const ITEMS_PER_PAGE = 20

const CategoryTable = ({ viewMode = "ADMIN" }) => {
    const [categories, setCategories] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(false)
    const [isLoading, setIsLoading] = useState({
        create: false,
        edit: {},
        prevPage: false,
        nextPage: false
    })
    const router = useRouter()

    const fetchCategories = async () => {
        setLoading(true)
        try {
            const res = await CategoryService.getAll()
            const sorted = res.data.sort((a, b) =>
                a.name.localeCompare(b.name, "vi", { sensitivity: "base" })
            )
            setCategories(sorted)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    const handleDelete = async (id) => {
        try {
            await CategoryService.delete(id)
            toast.success("Xóa danh mục thành công.")
            await fetchCategories()
        } catch (err) {
            console.error(err)
            toast.error(err.response?.data)
        }
    }

    const handleCreate = () => {
        router.push("/admin/categories/create")
    }

    const handleEdit = (id) => {
        router.push(`/admin/categories/${id}/edit`)
    }

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setIsLoading(prev => ({
                ...prev,
                [page < currentPage ? "prevPage" : "nextPage"]: true
            }))
            setCurrentPage(page)
            setTimeout(() => {
                setIsLoading(prev => ({
                    ...prev,
                    prevPage: false,
                    nextPage: false
                }))
            }, 300) // Giả lập loading ngắn
        }
    }

    const filteredCategories = searchTerm
        ? categories.filter(
            (cat) =>
                cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        : categories

    const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE)
    const paginatedCategories = filteredCategories.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm])

    return (
        <div>
            {/* Header */}
            <div className="space-y-4 flex flex-col items-center">
                {/* Search Input with Icon */}
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700 w-4 h-4"/>
                    <Input
                        placeholder="Nhập tiêu đề hoặc mô tả danh mục..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-200 border border-gray-500"
                    />
                </div>
            </div>

            <Separator />

            {/* Categories Section */}
            <div className="space-y-4 pt-8">
                {/* Categories Header */}
                <div className="flex items-center justify-between">
                    <div className="text-lg font-medium">Tổng số: {filteredCategories.length}</div>
                    {viewMode === "ADMIN" && (
                        <Button
                            onClick={handleCreate}
                            className="bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300 cursor-pointer transition-all duration-200 disabled:cursor-not-allowed"
                            variant="outline"
                            disabled={isLoading.create}
                        >
                            {isLoading.create ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Plus className="w-4 h-4 mr-2" />
                            )}
                            Thêm danh mục
                        </Button>
                    )}
                </div>

                {/* Category Cards */}
                {paginatedCategories.map((category, index) => (
                    <Card
                        key={category.id}
                        onClick={() => viewMode === "USER" && router.push(`/users/questions?categoryId=${category.id}`)}
                        className={cn(
                            "border border-gray-200 bg-white transition-all duration-200 hover:shadow-lg",
                            viewMode === "USER" && "cursor-pointer hover:scale-[1.02]"
                        )}
                    >
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-start">
                                <h2 className="text-lg sm:text-xl font-semibold text-purple-900 truncate">
                                    {index + 1}. {category.name}
                                </h2>
                                {viewMode === "ADMIN" && (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            title="Chỉnh sửa"
                                            className="p-1 text-primary hover:bg-gray-100"
                                            onClick={() => handleEdit(category.id)}
                                            disabled={isLoading.edit[category.id]}
                                        >
                                            {isLoading.edit[category.id] ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <Pencil className="w-5 h-5" />
                                            )}
                                        </Button>
                                        <DeleteButton
                                            id={category.id}
                                            handleDelete={handleDelete}
                                            className="p-1 text-red-600 hover:bg-red-50"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-blue-500" />
                                    <span>{category.description || "—"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ListCheck className="w-4 h-4 text-green-600" />
                                    <span className="font-semibold">{category.questionCount || 0} câu hỏi</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

            </div>

            {/* Loading */}
            {loading && (
                <div className="space-y-4">
                    {Array.from({ length: ITEMS_PER_PAGE }).map((_, idx) => (
                        <Card key={idx} className="border border-gray-200 bg-white">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-4 w-20 rounded" />
                                    <div className="ml-auto flex gap-2">
                                        <Skeleton className="h-6 w-6 rounded-full" />
                                        <Skeleton className="h-6 w-6 rounded-full" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Skeleton className="h-5 w-1/3 rounded" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <Skeleton className="h-10 rounded" />
                                    <Skeleton className="h-10 rounded" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* No results */}
            {!loading && paginatedCategories.length === 0 && searchTerm && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Search className="w-12 h-12 mb-4 opacity-50" />
                    <p>Không tìm thấy danh mục nào với từ khóa "{searchTerm}"</p>
                </div>
            )}

            {!loading && categories.length === 0 && !searchTerm && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <p>Danh sách trống!</p>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6 text-sm text-muted-foreground">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || isLoading.prevPage}
                        className="cursor-pointer transition-all duration-200 disabled:cursor-not-allowed"
                    >
                        {isLoading.prevPage ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : null}
                        Trang trước
                    </Button>
                    <span className="font-medium">
                        Trang {currentPage} / {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || isLoading.nextPage}
                        className="cursor-pointer transition-all duration-200 disabled:cursor-not-allowed"
                    >
                        {isLoading.nextPage ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : null}
                        Trang sau
                    </Button>
                </div>
            )}
        </div>
    )
}

export default CategoryTable