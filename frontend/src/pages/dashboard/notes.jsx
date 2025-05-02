import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Edit2, Save, X, Search, Filter, Tag, Calendar, SortAsc, SortDesc, Link as LinkIcon, Network, LayoutGrid, ZoomIn, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Graph from 'react-vis-network-graph';
import 'vis-network/styles/vis-network.css';

const demoNotes = [
  {
    id: 1,
    title: 'Welcome to Zen Garden',
    content: 'A peaceful space for mindful productivity and habit tracking.',
    createdAt: new Date().toISOString(),
    category: 'General',
    tags: ['welcome', 'getting-started'],
    priority: 'medium'
  },
  {
    id: 2,
    title: 'Daily Meditation',
    content: 'Start with 5 minutes of mindful breathing each morning.',
    createdAt: new Date().toISOString(),
    category: 'Habits',
    tags: ['meditation', 'wellness'],
    priority: 'high'
  },
  {
    id: 3,
    title: 'Focus Timer',
    content: 'Use 25-minute focus sessions for better productivity.',
    createdAt: new Date().toISOString(),
    category: 'Focus',
    tags: ['focus', 'productivity'],
    priority: 'high'
  },
  {
    id: 4,
    title: 'Morning Routine',
    content: 'Meditate, stretch, plan your day.',
    createdAt: new Date().toISOString(),
    category: 'Habits',
    tags: ['morning-routine', 'wellness'],
    priority: 'high'
  },
  {
    id: 5,
    title: 'Mindful Walking',
    content: 'Practice mindfulness during your daily walk.',
    createdAt: new Date().toISOString(),
    category: 'Habits',
    tags: ['meditation', 'wellness'],
    priority: 'medium'
  },
  {
    id: 6,
    title: 'Deep Work',
    content: 'Schedule 2-hour blocks for focused work.',
    createdAt: new Date().toISOString(),
    category: 'Focus',
    tags: ['focus', 'productivity'],
    priority: 'high'
  },
  {
    id: 7,
    title: 'Evening Review',
    content: 'Reflect on daily achievements and plan tomorrow.',
    createdAt: new Date().toISOString(),
    category: 'Habits',
    tags: ['evening-routine', 'productivity'],
    priority: 'medium'
  },
  {
    id: 8,
    title: 'Gratitude',
    content: 'List three things you\'re grateful for today.',
    createdAt: new Date().toISOString(),
    category: 'Habits',
    tags: ['wellness', 'meditation'],
    priority: 'medium'
  },
  {
    id: 9,
    title: 'Digital Detox',
    content: 'Take regular breaks from screens.',
    createdAt: new Date().toISOString(),
    category: 'Wellness',
    tags: ['wellness', 'focus'],
    priority: 'medium'
  },
  {
    id: 10,
    title: 'Sleep Routine',
    content: 'Maintain consistent sleep and wake times.',
    createdAt: new Date().toISOString(),
    category: 'Habits',
    tags: ['evening-routine', 'wellness'],
    priority: 'high'
  }
];

const categories = ['General', 'Habits', 'Focus', 'Personal', 'Work', 'Ideas'];
const priorities = ['low', 'medium', 'high'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  visible: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  },
  exit: { 
    opacity: 0,
    x: -50,
    scale: 0.9,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  },
  hover: {
    scale: 1.02,
    y: -5,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
};

const formVariants = {
  hidden: { 
    opacity: 0,
    height: 0,
    scale: 0.95
  },
  visible: { 
    opacity: 1,
    height: "auto",
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  },
  exit: { 
    opacity: 0,
    height: 0,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

export default function Notes() {
  const [notes, setNotes] = useState(demoNotes);
  const [newNote, setNewNote] = useState({ 
    title: '', 
    content: '', 
    category: 'General',
    tags: [],
    priority: 'medium'
  });
  const [editingNote, setEditingNote] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [newTag, setNewTag] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'graph'
  const [selectedNote, setSelectedNote] = useState(null);

  const getCategoryColor = (category) => {
    // Using a consistent white color for nodes to match the screenshot
    return 'rgb(255, 255, 255)';
  };

  const getTagColor = (tags) => {
    // Define color mappings for different tag categories with subtle, theme-matching colors
    const tagColors = {
      'meditation': 'rgba(120, 40, 40, 0.9)',      // Muted dark red
      'wellness': 'rgba(150, 50, 50, 0.9)',        // Warm red
      'productivity': 'rgba(180, 60, 60, 0.9)',    // Bright red
      'habits': 'rgba(140, 45, 45, 0.9)',          // Deep red
      'focus': 'rgba(160, 55, 55, 0.9)',           // Rich red
      'morning-routine': 'rgba(130, 42, 42, 0.9)', // Dark burgundy
      'evening-routine': 'rgba(170, 58, 58, 0.9)', // Light burgundy
      'science': 'rgba(190, 65, 65, 0.9)',         // Coral red
      'psychology': 'rgba(145, 48, 48, 0.9)',      // Ruby red
      'getting-started': 'rgba(135, 43, 43, 0.9)', // Wine red
    };

    // Find the first matching tag color
    for (const tag of tags) {
      if (tagColors[tag]) {
        return tagColors[tag];
      }
    }

    // Default color if no matching tags - subtle white with low opacity
    return 'rgba(200, 200, 200, 0.7)';
  };

  const graphOptions = {
    layout: {
      randomSeed: 2,
      improvedLayout: true,
      hierarchical: {
        enabled: false,
        direction: 'UD',
        sortMethod: 'directed',
        nodeSpacing: 200,
        levelSeparation: 250
      }
    },
    physics: {
      enabled: true,
      stabilization: {
        enabled: true,
        iterations: 1000,
        updateInterval: 25
      },
      barnesHut: {
        gravitationalConstant: -3000,
        centralGravity: 0.2,
        springLength: 250,
        springConstant: 0.04,
        damping: 0.09,
        avoidOverlap: 1
      },
      repulsion: {
        nodeDistance: 200
      }
    },
    nodes: {
      borderWidth: 1,
      borderWidthSelected: 2,
      chosen: true,
      color: {
        border: 'rgba(255, 255, 255, 0.1)',
        highlight: {
          border: 'rgba(255, 255, 255, 0.3)'
        },
        hover: {
          border: 'rgba(255, 255, 255, 0.2)'
        }
      },
      font: {
        color: 'rgba(255, 255, 255, 0.9)',
        size: 16,
        face: 'Sans-Serif',
        strokeWidth: 2,
        strokeColor: 'rgba(40, 0, 0, 0.8)'
      },
      shape: 'dot',
      size: 25,
      shadow: {
        enabled: true,
        color: 'rgba(20, 0, 0, 0.3)',
        size: 10,
        x: 2,
        y: 2
      }
    },
    edges: {
      color: {
        color: 'rgba(255, 255, 255, 0.1)',
        highlight: 'rgba(255, 255, 255, 0.3)',
        hover: 'rgba(255, 255, 255, 0.2)',
        inherit: false
      },
      width: 1,
      hoverWidth: 1.5,
      selectionWidth: 2,
      smooth: {
        type: 'continuous',
        forceDirection: 'none',
        roundness: 0.5
      },
      scaling: {
        min: 1,
        max: 3
      }
    },
    interaction: {
      hover: true,
      tooltipDelay: 200,
      zoomView: true,
      dragView: true,
      multiselect: false,
      keyboard: true,
      navigationButtons: false,
      zoomSpeed: 1.2
    }
  };

  const graphData = useMemo(() => {
    const nodes = notes.map(note => ({
      id: note.id,
      label: note.title,
      color: {
        background: getTagColor(note.tags),
        border: 'rgba(255, 255, 255, 0.1)',
        highlight: {
          background: getTagColor(note.tags),
          border: 'rgba(255, 255, 255, 0.3)'
        },
        hover: {
          background: getTagColor(note.tags),
          border: 'rgba(255, 255, 255, 0.2)'
        }
      },
      font: {
        color: 'rgba(255, 255, 255, 0.9)',
        size: 16,
        face: 'Sans-Serif',
        strokeWidth: 2,
        strokeColor: 'rgba(40, 0, 0, 0.8)'
      }
    }));

    // Create edges based on shared tags
    const edges = [];
    const processedPairs = new Set();

    notes.forEach((note1, index) => {
      notes.slice(index + 1).forEach(note2 => {
        // Check for shared tags
        const sharedTags = note1.tags.filter(tag => note2.tags.includes(tag));
        
        if (sharedTags.length > 0) {
          // Create a unique key for this pair to avoid duplicates
          const pairKey = [note1.id, note2.id].sort().join('-');
          
          if (!processedPairs.has(pairKey)) {
            processedPairs.add(pairKey);
            
            // Calculate edge weight based on number of shared tags
            const weight = sharedTags.length;
            
            edges.push({
              from: note1.id,
              to: note2.id,
              color: {
                color: `rgba(255, 255, 255, ${0.1 + (weight * 0.1)})`,
                highlight: `rgba(255, 255, 255, ${0.3 + (weight * 0.1)})`,
                hover: `rgba(255, 255, 255, ${0.2 + (weight * 0.1)})`,
                inherit: false
              },
              width: weight,
              hoverWidth: weight + 0.5,
              selectionWidth: weight + 1,
              smooth: {
                type: 'continuous',
                forceDirection: 'none',
                roundness: 0.5
              }
            });
          }
        }
      });
    });

    return { nodes, edges };
  }, [notes]);

  const graphEvents = {
    select: function(event) {
      const { nodes } = event;
      if (nodes.length > 0) {
        const selectedNote = notes.find(n => n.id === nodes[0]);
        if (selectedNote) {
          // Find connected notes based on shared tags
          const connectedNotes = notes.filter(note => {
            if (note.id === selectedNote.id) return false;
            return note.tags.some(tag => selectedNote.tags.includes(tag));
          });
          
          setSelectedNote({
            ...selectedNote,
            connectedNotes: connectedNotes
          });
        }
      }
    },
    deselect: function() {
      setSelectedNote(null);
    },
    zoom: function(event) {
      const network = event.network;
      if (network) {
        const scale = network.getScale();
        const nodes = network.body.nodes;
        
        Object.values(nodes).forEach(node => {
          const baseSize = 16;
          const newSize = baseSize / scale;
          node.options.font.size = Math.min(Math.max(12, newSize), 24);
        });
        
        network.redraw();
      }
    }
  };

  const filteredNotes = useMemo(() => {
    return notes
      .filter(note => {
        const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = selectedCategory === 'All' || note.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'date') {
          return sortOrder === 'asc' 
            ? new Date(a.createdAt) - new Date(b.createdAt)
            : new Date(b.createdAt) - new Date(a.createdAt);
        } else if (sortBy === 'priority') {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return sortOrder === 'asc'
            ? priorityOrder[a.priority] - priorityOrder[b.priority]
            : priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return 0;
      });
  }, [notes, searchQuery, selectedCategory, sortBy, sortOrder]);

  const handleAddNote = () => {
    if (newNote.title.trim() && newNote.content.trim()) {
      const note = {
        id: Date.now(),
        ...newNote,
        createdAt: new Date().toISOString(),
      };
      setNotes([note, ...notes]);
      setNewNote({ 
        title: '', 
        content: '', 
        category: 'General',
        tags: [],
        priority: 'medium'
      });
      setIsAdding(false);
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
  };

  const handleSaveEdit = () => {
    if (editingNote.title.trim() && editingNote.content.trim()) {
      setNotes(notes.map(note => 
        note.id === editingNote.id ? editingNote : note
      ));
      setEditingNote(null);
    }
  };

  const handleDeleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !newNote.tags.includes(newTag.trim())) {
      setNewNote({
        ...newNote,
        tags: [...newNote.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setNewNote({
      ...newNote,
      tags: newNote.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-500';
      case 'medium': return 'bg-yellow-500/20 text-yellow-500';
      case 'low': return 'bg-green-500/20 text-green-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  const handleAddLink = (sourceId, targetId) => {
    if (sourceId === targetId) return;
    
    setNotes(notes.map(note => {
      if (note.id === sourceId && !note.links.includes(targetId)) {
        return { ...note, links: [...note.links, targetId] };
      }
      return note;
    }));
  };

  const handleRemoveLink = (sourceId, targetId) => {
    setNotes(notes.map(note => {
      if (note.id === sourceId) {
        return { ...note, links: note.links.filter(id => id !== targetId) };
      }
      return note;
    }));
  };

  // Prevent page scrolling when interacting with the graph
  useEffect(() => {
    const graphContainer = document.querySelector('.vis-network');
    if (graphContainer) {
      const preventScroll = (e) => {
        e.preventDefault();
      };
      
      graphContainer.addEventListener('wheel', preventScroll, { passive: false });
      
      return () => {
        graphContainer.removeEventListener('wheel', preventScroll);
      };
    }
  }, []);

  return (
    <div className="p-6 max-w-[2000px] mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-4 mb-8"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-wax-flower-900 dark:text-wax-flower-50">Notes</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-wax-flower-500 text-white rounded-lg hover:bg-wax-flower-600 transition-colors shadow-lg shadow-wax-flower-500/20"
          >
            <Plus size={20} />
            Add Note
          </motion.button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-wax-flower-500/50" size={20} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-wax-flower-200/50 dark:border-wax-flower-800/50 rounded-lg bg-white/90 dark:bg-wax-flower-900/20 focus:border-wax-flower-400 dark:focus:border-wax-flower-500 focus-visible:ring-1 focus-visible:ring-wax-flower-500/30 text-wax-flower-800 dark:text-wax-flower-200"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-wax-flower-200/50 dark:border-wax-flower-800/50 rounded-lg bg-white/90 dark:bg-wax-flower-900/20 focus:border-wax-flower-400 dark:focus:border-wax-flower-500 focus-visible:ring-1 focus-visible:ring-wax-flower-500/30 text-wax-flower-800 dark:text-wax-flower-200"
            >
              <option value="All">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-wax-flower-200/50 dark:border-wax-flower-800/50 rounded-lg bg-white/90 dark:bg-wax-flower-900/20 focus:border-wax-flower-400 dark:focus:border-wax-flower-500 focus-visible:ring-1 focus-visible:ring-wax-flower-500/30 text-wax-flower-800 dark:text-wax-flower-200"
            >
              <option value="date">Sort by Date</option>
              <option value="priority">Sort by Priority</option>
            </select>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-wax-flower-200/50 dark:border-wax-flower-800/50 rounded-lg bg-white/90 dark:bg-wax-flower-900/20 hover:bg-wax-flower-500/10 transition-colors"
            >
              {sortOrder === 'asc' ? <SortAsc size={20} /> : <SortDesc size={20} />}
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notes Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <AnimatePresence>
            {filteredNotes.map((note) => (
              <motion.div
                key={note.id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                whileHover="hover"
                className="bg-white/80 dark:bg-wax-flower-950/80 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-wax-flower-200/30 dark:border-wax-flower-800/30"
              >
                {editingNote?.id === note.id ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <input
                        type="text"
                        value={editingNote.title}
                        onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                        className="text-lg font-semibold p-3 border border-wax-flower-200/50 dark:border-wax-flower-800/50 rounded-lg w-full bg-white/90 dark:bg-wax-flower-900/20 focus:border-wax-flower-400 dark:focus:border-wax-flower-500 focus-visible:ring-1 focus-visible:ring-wax-flower-500/30 text-wax-flower-800 dark:text-wax-flower-200"
                      />
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={handleSaveEdit}
                          className="text-wax-flower-500 hover:text-wax-flower-700 dark:text-wax-flower-400 dark:hover:text-wax-flower-200"
                        >
                          <Save size={20} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setEditingNote(null)}
                          className="text-wax-flower-500 hover:text-wax-flower-700 dark:text-wax-flower-400 dark:hover:text-wax-flower-200"
                        >
                          <X size={20} />
                        </motion.button>
                      </div>
                    </div>
                    <ReactQuill
                      theme="snow"
                      value={editingNote.content}
                      onChange={(content) => setEditingNote({ ...editingNote, content })}
                      className="bg-white/90 dark:bg-wax-flower-900/20 rounded-lg mb-4"
                    />
                  </motion.div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h2 className="text-lg font-semibold text-wax-flower-900 dark:text-wax-flower-50">{note.title}</h2>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(note.priority)}`}>
                          {note.priority.charAt(0).toUpperCase() + note.priority.slice(1)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEditNote(note)}
                          className="text-wax-flower-500 hover:text-wax-flower-700 dark:text-wax-flower-400 dark:hover:text-wax-flower-200"
                        >
                          <Edit2 size={20} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-wax-flower-500 hover:text-wax-flower-700 dark:text-wax-flower-400 dark:hover:text-wax-flower-200"
                        >
                          <Trash2 size={20} />
                        </motion.button>
                      </div>
                    </div>
                    <div className="prose dark:prose-invert max-w-none mb-4" dangerouslySetInnerHTML={{ __html: note.content }} />
                    <div className="flex flex-wrap gap-2 mb-2">
                      {note.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-wax-flower-500/10 text-wax-flower-500 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-sm text-wax-flower-500/70 dark:text-wax-flower-400/70">
                      <span>{note.category}</span>
                      <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Graph View */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-[800px] bg-[rgb(40,0,0)] rounded-xl shadow-xl border border-white/10 overflow-hidden relative"
        >
          <div className="p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">Note Connections</h2>
          </div>
          <div className="graph-container" style={{ height: 'calc(100% - 65px)', width: '100%' }}>
            <Graph
              graph={graphData}
              options={graphOptions}
              events={graphEvents}
              style={{ height: '100%', width: '100%', background: 'rgb(40,0,0)' }}
            />
          </div>
        </motion.div>
      </div>

      {/* Add Note Modal */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setIsAdding(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-wax-flower-950 rounded-xl shadow-xl border border-wax-flower-200/30 dark:border-wax-flower-800/30 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-wax-flower-900 dark:text-wax-flower-50">Add New Note</h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsAdding(false)}
                  className="text-wax-flower-500 hover:text-wax-flower-700 dark:text-wax-flower-400 dark:hover:text-wax-flower-200"
                >
                  <X size={20} />
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-wax-flower-700 dark:text-wax-flower-300 mb-1">Title</label>
                  <input
                    type="text"
                    placeholder="Note title"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    className="w-full p-3 border border-wax-flower-200/50 dark:border-wax-flower-800/50 rounded-lg bg-white/90 dark:bg-wax-flower-900/20 focus:border-wax-flower-400 dark:focus:border-wax-flower-500 focus-visible:ring-1 focus-visible:ring-wax-flower-500/30 text-wax-flower-800 dark:text-wax-flower-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-wax-flower-700 dark:text-wax-flower-300 mb-1">Category</label>
                  <select
                    value={newNote.category}
                    onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
                    className="w-full p-3 border border-wax-flower-200/50 dark:border-wax-flower-800/50 rounded-lg bg-white/90 dark:bg-wax-flower-900/20 focus:border-wax-flower-400 dark:focus:border-wax-flower-500 focus-visible:ring-1 focus-visible:ring-wax-flower-500/30 text-wax-flower-800 dark:text-wax-flower-200"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-wax-flower-700 dark:text-wax-flower-300 mb-1">Content</label>
                <ReactQuill
                  theme="snow"
                  value={newNote.content}
                  onChange={(content) => setNewNote({ ...newNote, content })}
                  className="bg-white/90 dark:bg-wax-flower-900/20 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-wax-flower-700 dark:text-wax-flower-300 mb-1">Priority</label>
                  <select
                    value={newNote.priority}
                    onChange={(e) => setNewNote({ ...newNote, priority: e.target.value })}
                    className="w-full p-3 border border-wax-flower-200/50 dark:border-wax-flower-800/50 rounded-lg bg-white/90 dark:bg-wax-flower-900/20 focus:border-wax-flower-400 dark:focus:border-wax-flower-500 focus-visible:ring-1 focus-visible:ring-wax-flower-500/30 text-wax-flower-800 dark:text-wax-flower-200"
                  >
                    {priorities.map(priority => (
                      <option key={priority} value={priority}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-wax-flower-700 dark:text-wax-flower-300 mb-1">Tags</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      className="flex-1 p-3 border border-wax-flower-200/50 dark:border-wax-flower-800/50 rounded-lg bg-white/90 dark:bg-wax-flower-900/20 focus:border-wax-flower-400 dark:focus:border-wax-flower-500 focus-visible:ring-1 focus-visible:ring-wax-flower-500/30 text-wax-flower-800 dark:text-wax-flower-200"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-wax-flower-500 text-white rounded-lg hover:bg-wax-flower-600 transition-colors"
                    >
                      Add
                    </motion.button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newNote.tags.map(tag => (
                      <motion.span
                        key={tag}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-1 px-2 py-1 bg-wax-flower-500/10 text-wax-flower-500 rounded-full text-sm"
                      >
                        {tag}
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.8 }}
                          onClick={() => handleRemoveTag(tag)}
                          className="text-wax-flower-500 hover:text-wax-flower-700"
                        >
                          <X size={14} />
                        </motion.button>
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 border border-wax-flower-200/50 dark:border-wax-flower-800/50 text-wax-flower-700 dark:text-wax-flower-300 rounded-lg hover:bg-wax-flower-50 dark:hover:bg-wax-flower-900/50 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddNote}
                  className="px-4 py-2 bg-wax-flower-500 text-white rounded-lg hover:bg-wax-flower-600 transition-colors shadow-lg shadow-wax-flower-500/20"
                >
                  Save Note
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Note Details Modal */}
      {selectedNote && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedNote(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white/90 dark:bg-wax-flower-950/90 backdrop-blur-sm rounded-xl shadow-xl border border-wax-flower-200/30 dark:border-wax-flower-800/30 p-6 max-w-2xl w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-wax-flower-900 dark:text-wax-flower-50">{selectedNote.title}</h2>
              <button
                onClick={() => setSelectedNote(null)}
                className="text-wax-flower-500 hover:text-wax-flower-700 dark:text-wax-flower-400 dark:hover:text-wax-flower-200"
              >
                <X size={20} />
              </button>
            </div>
            <div className="prose dark:prose-invert max-w-none mb-4" dangerouslySetInnerHTML={{ __html: selectedNote.content }} />
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedNote.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-wax-flower-500/10 text-wax-flower-500 rounded-full text-xs">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex justify-between items-center text-sm text-wax-flower-500/70 dark:text-wax-flower-400/70">
              <span>{selectedNote.category}</span>
              <span>{new Date(selectedNote.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Connected Notes</h3>
              <div className="flex flex-wrap gap-2">
                {selectedNote.connectedNotes?.map(connectedNote => (
                  <button
                    key={connectedNote.id}
                    onClick={() => setSelectedNote({
                      ...connectedNote,
                      connectedNotes: notes.filter(note => {
                        if (note.id === connectedNote.id) return false;
                        return note.tags.some(tag => connectedNote.tags.includes(tag));
                      })
                    })}
                    className="px-3 py-1 bg-wax-flower-500/10 text-wax-flower-500 rounded-lg hover:bg-wax-flower-500/20 transition-colors"
                  >
                    {connectedNote.title}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
} 