import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}

interface EmojiCategory {
  label: string;
  emojis: string[];
}

const EMOJI_CATEGORIES: Record<string, EmojiCategory> = {
  frequently_used: {
    label: "Frequently Used",
    emojis: ["😀", "😂", "❤️", "👍", "😊", "🎉", "😍", "🤔"],
  },
  smileys: {
    label: "Smileys & People",
    emojis: [
      "😀",
      "😃",
      "😄",
      "😁",
      "😆",
      "😅",
      "😂",
      "🤣",
      "😊",
      "😇",
      "🙂",
      "🙃",
      "😉",
      "😌",
      "😍",
      "🥰",
      "😘",
      "😗",
      "😙",
      "😚",
      "😋",
      "😛",
      "😝",
      "😜",
      "🤪",
      "🤨",
      "🧐",
      "🤓",
      "😎",
      "🤩",
      "🥳",
      "😏",
      "😒",
      "😞",
      "😔",
      "😟",
      "😕",
      "🙁",
      "☹️",
      "😣",
      "😖",
      "😫",
      "😩",
      "🥺",
      "😢",
      "😭",
      "😤",
      "😠",
      "😡",
      "🤬",
    ],
  },
  hearts: {
    label: "Hearts",
    emojis: [
      "❤️",
      "🧡",
      "💛",
      "💚",
      "💙",
      "💜",
      "🖤",
      "🤍",
      "🤎",
      "💔",
      "❣️",
      "💕",
      "💞",
      "💓",
      "💗",
      "💖",
      "💘",
      "💝",
      "💟",
    ],
  },
  gestures: {
    label: "Hand Gestures",
    emojis: [
      "👍",
      "👎",
      "👌",
      "✌️",
      "🤞",
      "🤟",
      "🤘",
      "🤙",
      "👈",
      "👉",
      "👆",
      "🖕",
      "👇",
      "☝️",
      "👋",
      "🤚",
      "🖐️",
      "✋",
      "🖖",
      "👏",
      "🙌",
      "🤲",
      "🤝",
      "🙏",
      "✍️",
      "💪",
      "🦵",
      "🦶",
    ],
  },
  activities: {
    label: "Activities",
    emojis: [
      "🎉",
      "🎊",
      "🎈",
      "🎂",
      "🎁",
      "🎀",
      "🎗️",
      "🎟️",
      "🎫",
      "🎖️",
      "🏆",
      "🏅",
      "🥇",
      "🥈",
      "🥉",
      "⚽",
      "🏀",
      "🏈",
      "⚾",
      "🥎",
      "🎾",
      "🏐",
      "🏉",
      "🥏",
      "🎱",
      "🪀",
      "🏓",
      "🏸",
      "🏒",
      "🏑",
    ],
  },
  nature: {
    label: "Nature",
    emojis: [
      "🌱",
      "🌿",
      "🍀",
      "🌾",
      "🌵",
      "🌲",
      "🌳",
      "🌴",
      "🌺",
      "🌻",
      "🌷",
      "🌹",
      "🥀",
      "🌸",
      "💐",
      "🍄",
      "🌰",
      "🎃",
      "🐶",
      "🐱",
      "🐭",
      "🐹",
      "🐰",
      "🦊",
      "🐻",
      "🐼",
      "🐨",
      "🐯",
      "🦁",
      "🐮",
    ],
  },
  food: {
    label: "Food & Drink",
    emojis: [
      "🍎",
      "🍊",
      "🍋",
      "🍌",
      "🍉",
      "🍇",
      "🍓",
      "🫐",
      "🍈",
      "🍒",
      "🍑",
      "🥭",
      "🍍",
      "🥥",
      "🥝",
      "🍅",
      "🍆",
      "🥑",
      "🥦",
      "🥬",
      "🥒",
      "🌶️",
      "🫑",
      "🌽",
      "🥕",
      "🧄",
      "🧅",
      "🥔",
      "🍠",
      "🥐",
    ],
  },
  travel: {
    label: "Travel & Places",
    emojis: [
      "🚗",
      "🚕",
      "🚙",
      "🚌",
      "🚎",
      "🏎️",
      "🚓",
      "🚑",
      "🚒",
      "🚐",
      "🛻",
      "🚚",
      "🚛",
      "🚜",
      "🏍️",
      "🛵",
      "🚲",
      "🛴",
      "🛹",
      "🛼",
      "🚁",
      "🛸",
      "✈️",
      "🛩️",
      "🪂",
      "⛵",
      "🚤",
      "🛥️",
      "🛳️",
      "⛴️",
    ],
  },
  objects: {
    label: "Objects",
    emojis: [
      "⌚",
      "📱",
      "📲",
      "💻",
      "⌨️",
      "🖥️",
      "🖨️",
      "🖱️",
      "🖲️",
      "🕹️",
      "🗜️",
      "💽",
      "💾",
      "💿",
      "📀",
      "📼",
      "📷",
      "📸",
      "📹",
      "🎥",
      "📞",
      "☎️",
      "📟",
      "📠",
      "📺",
      "📻",
      "🎙️",
      "🎚️",
      "🎛️",
      "🧭",
    ],
  },
};

const EmojiPicker: React.FC<EmojiPickerProps> = ({
  isOpen,
  onClose,
  onEmojiSelect,
  anchorRef,
}) => {
  const [selectedCategory, setSelectedCategory] = useState("frequently_used");
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculatePosition = () => {
      if (!anchorRef.current) return;

      const anchorRect = anchorRef.current.getBoundingClientRect();
      const pickerWidth = 320;
      const pickerHeight = 384;

      // Position above the button by default
      let top = anchorRect.top - pickerHeight - 8;
      let left = anchorRect.left - pickerWidth + anchorRect.width;

      // Adjust if picker would go off screen
      if (top < 8) {
        // If not enough space above, show to the side
        top = anchorRect.top;
        left = anchorRect.left - pickerWidth - 8;
      }

      // If still off screen to the left, show on the right
      if (left < 8) {
        left = anchorRect.right + 8;
      }

      // If off screen to the right, align to right edge of screen
      if (left + pickerWidth > window.innerWidth - 8) {
        left = window.innerWidth - pickerWidth - 8;
      }

      // If off screen at bottom, position above
      if (top + pickerHeight > window.innerHeight - 8) {
        top = anchorRect.top - pickerHeight - 8;
      }

      setPosition({ top, left });
    };

    if (isOpen) {
      calculatePosition();
      window.addEventListener("resize", calculatePosition);
      window.addEventListener("scroll", calculatePosition);
    }

    return () => {
      window.removeEventListener("resize", calculatePosition);
      window.removeEventListener("scroll", calculatePosition);
    };
  }, [isOpen, anchorRef]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen) return null;

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    onClose();
  };

  const pickerContent = (
    <div
      ref={pickerRef}
      className="fixed w-80 h-96 bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] flex flex-col"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="p-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800">Choose an emoji</h3>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-200 bg-gray-50">
        {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
              selectedCategory === key
                ? "border-[#FB406C] text-[#FB406C] bg-white"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Emoji Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-8 gap-1">
          {EMOJI_CATEGORIES[selectedCategory].emojis.map(
            (emoji: string, index: number) => (
              <button
                key={index}
                onClick={() => handleEmojiClick(emoji)}
                className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded transition-colors"
                title={`Add ${emoji}`}
              >
                {emoji}
              </button>
            ),
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(pickerContent, document.body);
};

export default EmojiPicker;
