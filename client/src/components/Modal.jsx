const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark Blur Backdrop */}
            <div 
                className="absolute inset-0 bg-[#0A1128]/80 backdrop-blur-sm transition-opacity duration-300" 
                onClick={onClose}
            ></div>
            
            {/* Modal Box */}
            <div className="relative bg-navy border border-navy-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden z-10 transform scale-100 transition-all duration-300 animate-fade-in-up">
                {/* Header */}
                <div className="p-5 border-b border-navy-border flex items-center justify-between bg-navy-dark/40">
                    <h3 className="text-md font-bold text-slate-100 tracking-wide">{title}</h3>
                    <button 
                        onClick={onClose} 
                        className="text-slate-400 hover:text-white transition duration-150 p-1.5 hover:bg-navy-light rounded-lg text-sm"
                        title="Close Modal"
                    >
                        ✕
                    </button>
                </div>
                {/* Content Body */}
                <div className="p-5">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default Modal
