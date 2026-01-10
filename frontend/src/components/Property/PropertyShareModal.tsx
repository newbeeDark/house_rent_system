import React from 'react';
import type { Property } from '../../types';

interface PropertyShareModalProps {
    property: Property;
    onClose: () => void;
}

/**
 * PropertyShareModal Component
 * 
 * Functionality:
 * - Generates formatted sharing text for property listings
 * - Provides social media sharing buttons (Facebook, WhatsApp, Twitter, Telegram, Instagram)
 * - Supports direct link copying to clipboard
 * - Uses browser native APIs for sharing (window.open, navigator.clipboard)
 * 
 * @param property - The property object to share
 * @param onClose - Callback function to close the modal
 */
const PropertyShareModal: React.FC<PropertyShareModalProps> = ({ property, onClose }) => {

    /**
     * Generate Share Description
     * 
     * Purpose: Creates a uniform, attractive sharing message for all platforms
     * Format: Emoji + bedroom count + property title + price + call-to-action
     * 
     * @param title - Property title
     * @param price - Monthly rental price
     * @param beds - Number of bedrooms
     * @returns Formatted sharing text string
     */
    const getShareDescription = (title: string, price: number, beds: number) => {
        return `🏠 Check out this amazing ${beds}-bedroom property! "${title}" - Only RM${price}/month. Your perfect home awaits! 🌟`;
    };

    // Generate the sharing description for the current property
    const shareDescription = getShareDescription(
        property.title,
        property.price,
        property.beds
    );

    /**
     * Share URL Construction
     * 
     * Format: {origin}/property/{id}
     * - Uses window.location.origin to ensure correct domain
     * - Links directly to property details page
     * - Works for both localhost and production domains
     */
    const shareUrl = `${window.location.origin}/property/${property.id}`;

    /**
     * Share to Facebook
     * 
     * Method: Uses Facebook's web sharer dialog
     * API Endpoint: https://www.facebook.com/sharer/sharer.php
     * Parameters:
     * - u: URL to share (encoded)
     * - quote: Pre-filled message text (encoded)
     * 
     * Opens in a new popup window (600x400px)
     */
    const shareToFacebook = () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareDescription)}`;
        window.open(url, '_blank', 'width=600,height=400');
    };

    /**
     * Share to WhatsApp
     * 
     * Method: Uses WhatsApp's web sharing protocol
     * API Endpoint: https://wa.me/
     * Parameters:
     * - text: Combined message and URL (encoded)
     * 
     * Opens WhatsApp web or mobile app with pre-filled message
     */
    const shareToWhatsApp = () => {
        const text = `${shareDescription}\n\n${shareUrl}`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank', 'width=600,height=400');
    };

    /**
     * Share to Twitter
     * 
     * Method: Uses Twitter's web intent API
     * API Endpoint: https://twitter.com/intent/tweet
     * Parameters:
     * - text: Tweet content (encoded)
     * - url: URL to share (encoded)
     * 
     * Opens Twitter with pre-filled tweet
     */
    const shareToTwitter = () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareDescription)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank', 'width=600,height=400');
    };

    /**
     * Share to Telegram
     * 
     * Method: Uses Telegram's sharing URL scheme
     * API Endpoint: https://t.me/share/url
     * Parameters:
     * - url: URL to share (encoded)
     * - text: Message text (encoded)
     * 
     * Opens Telegram with pre-filled message
     */
    const shareToTelegram = () => {
        const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareDescription)}`;
        window.open(url, '_blank', 'width=600,height=400');
    };

    /**
     * Share to Instagram
     * 
     * Limitation: Instagram has no official web sharing API
     * Workaround: Copy text to clipboard and prompt user to paste
     * 
     * Process:
     * 1. Copy sharing text + URL to clipboard using navigator.clipboard API
     * 2. Alert user with instructions to paste in Instagram
     * 3. User must manually paste into Instagram app/web
     */
    const shareToInstagram = async () => {
        try {
            const text = `${shareDescription}\n\n${shareUrl}`;
            await navigator.clipboard.writeText(text);
            alert('Link copied! Open Instagram and paste it in your story or post.');
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            alert('Failed to copy link. Please try again.');
        }
    };

    /**
     * Copy Link to Clipboard
     * 
     * Purpose: Direct link copying without opening any app
     * Method: Uses Clipboard API (navigator.clipboard.writeText)
     * 
     * Provides user feedback:
     * - Success: Alert confirmation
     * - Failure: Error logging and user notification
     */
    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            alert('Link copied to clipboard!');
        } catch (error) {
            console.error('Failed to copy link:', error);
            alert('Failed to copy link. Please try again.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-xl font-bold mb-4">Share this property</h3>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                        onClick={shareToFacebook}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Facebook
                    </button>

                    <button
                        onClick={shareToWhatsApp}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        WhatsApp
                    </button>

                    <button
                        onClick={shareToTwitter}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                        Twitter
                    </button>

                    <button
                        onClick={shareToTelegram}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                        </svg>
                        Telegram
                    </button>

                    <button
                        onClick={shareToInstagram}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                        </svg>
                        Instagram
                    </button>

                    <button
                        onClick={copyLink}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy Link
                    </button>
                </div>

                <button
                    onClick={onClose}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default PropertyShareModal;
