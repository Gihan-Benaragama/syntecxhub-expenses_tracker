import { useCallback } from 'react'

const CATEGORIES = ['All', 'Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Education', 'Other']

const FilterBar = ({ filterCategory, setFilterCategory }) => {
    const handleFilter = useCallback((cat) => {
        setFilterCategory(cat)
    }, [setFilterCategory])

    return (
        <div className="flex flex-wrap gap-2 mb-6">
            {CATEGORIES.map(cat => (
                <button
                    key={cat}
                    onClick={() => handleFilter(cat)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition
            ${filterCategory === cat
                            ? 'bg-blue-500 text-white shadow'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    {cat}
                </button>
            ))}
        </div>
    )
}

export default FilterBar