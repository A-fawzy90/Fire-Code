import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, 
  BookOpen, 
  Filter, 
  Layers, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Copy,
  Check,
  Flame,
  Info,
  Calendar,
  Building,
  Bookmark,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Sparkles,
  ArrowUp,
  Share2,
  Printer,
  FileCheck2,
  Sliders,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { 
  SOURCE_DOCUMENTS, 
  CODE_PROVISIONS, 
  OCCUPANCY_CLASSIFICATIONS, 
  OFFICIAL_METADATA 
} from '../data/codeKnowledgeBase';

export default function CodeLibrary({ lang, onOpenAssistant }) {
  const isAr = lang === 'ar';

  // Main Tabs: 'reader' (Full Code Free Browser), 'provisions' (Provisions Search), 'classifications' (Table 2-1), 'documents' (Source PDFs)
  const [activeTab, setActiveTab] = useState('reader');

  // Reader Mode State
  const [selectedDocId, setSelectedDocId] = useState('part-1');
  const [selectedChapterId, setSelectedChapterId] = useState('ch-1');
  const [chapterFilterQuery, setChapterFilterQuery] = useState('');
  const [treeSearchQuery, setTreeSearchQuery] = useState('');
  const [fontSizeLevel, setFontSizeLevel] = useState(1); // 0: Small, 1: Normal, 2: Large
  const [bookmarkedArticleIds, setBookmarkedArticleIds] = useState([]);
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [selectedVolumeFilter, setSelectedVolumeFilter] = useState('all');

  // Provisions Mode State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocFilter, setSelectedDocFilter] = useState('all');
  const [selectedEditionFilter, setSelectedEditionFilter] = useState('2026');

  // Classification Mode State
  const [occupancySearch, setOccupancySearch] = useState('');

  const readerTopRef = useRef(null);

  // Find currently selected document and chapter
  const currentDoc = useMemo(() => {
    return SOURCE_DOCUMENTS.find(d => d.id === selectedDocId) || SOURCE_DOCUMENTS[1];
  }, [selectedDocId]);

  const currentChapter = useMemo(() => {
    if (!currentDoc || !currentDoc.chapters) return null;
    return currentDoc.chapters.find(c => c.id === selectedChapterId) || currentDoc.chapters[0];
  }, [currentDoc, selectedChapterId]);

  // List of all chapters flattened for previous/next navigation
  const allChaptersFlat = useMemo(() => {
    const list = [];
    SOURCE_DOCUMENTS.forEach(doc => {
      if (doc.chapters) {
        doc.chapters.forEach(ch => {
          list.push({ docId: doc.id, docCode: doc.codeNumber, chapter: ch });
        });
      }
    });
    return list;
  }, []);

  const currentChapterIndex = useMemo(() => {
    return allChaptersFlat.findIndex(
      item => item.docId === selectedDocId && item.chapter.id === selectedChapterId
    );
  }, [allChaptersFlat, selectedDocId, selectedChapterId]);

  const prevChapterItem = currentChapterIndex > 0 ? allChaptersFlat[currentChapterIndex - 1] : null;
  const nextChapterItem = currentChapterIndex < allChaptersFlat.length - 1 ? allChaptersFlat[currentChapterIndex + 1] : null;

  // Change chapter handler
  const handleSelectChapter = (docId, chapterId) => {
    setSelectedDocId(docId);
    setSelectedChapterId(chapterId);
    setChapterFilterQuery('');
    setShowOnlyBookmarks(false);
    if (readerTopRef.current) {
      readerTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Font size multiplier
  const fontSizes = {
    0: { base: '0.86rem', quote: '0.94rem', heading: '1.02rem' },
    1: { base: '0.94rem', quote: '1.02rem', heading: '1.14rem' },
    2: { base: '1.06rem', quote: '1.18rem', heading: '1.28rem' }
  };
  const activeFontSize = fontSizes[fontSizeLevel];

  // Copy handler
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  // Bookmark toggle
  const toggleBookmark = (id) => {
    setBookmarkedArticleIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Filter provisions for View 2
  const filteredProvisions = useMemo(() => {
    return CODE_PROVISIONS.filter(p => {
      if (selectedEditionFilter !== 'all' && p.edition !== selectedEditionFilter) return false;
      if (selectedDocFilter !== 'all' && p.documentId !== selectedDocFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchText = (p.sourceTextAr || '').toLowerCase().includes(q) ||
                          (p.subjectAr || '').toLowerCase().includes(q) ||
                          (p.articleNum || '').toLowerCase().includes(q) ||
                          (p.plainExplanationAr || '').toLowerCase().includes(q) ||
                          (p.tags || []).some(t => t.toLowerCase().includes(q));
        if (!matchText) return false;
      }
      return true;
    });
  }, [selectedEditionFilter, selectedDocFilter, searchQuery]);

  // Filter articles in current chapter
  const currentArticles = useMemo(() => {
    if (!currentChapter || !currentChapter.articles) return [];
    let list = currentChapter.articles;
    if (showOnlyBookmarks) {
      list = list.filter((_, idx) => bookmarkedArticleIds.includes(`${currentChapter.id}-${idx}`));
    }
    if (chapterFilterQuery.trim()) {
      const q = chapterFilterQuery.toLowerCase();
      list = list.filter(art => 
        (art.articleNum || '').toLowerCase().includes(q) ||
        (art.titleAr || '').toLowerCase().includes(q) ||
        (art.officialTextAr || '').toLowerCase().includes(q) ||
        (art.engineeringExplanationAr || '').toLowerCase().includes(q) ||
        (art.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [currentChapter, chapterFilterQuery, showOnlyBookmarks, bookmarkedArticleIds]);

  // Filtered documents in sidebar tree based on volume filter & search
  const visibleDocuments = useMemo(() => {
    return SOURCE_DOCUMENTS.filter(doc => {
      if (selectedVolumeFilter !== 'all' && doc.id !== selectedVolumeFilter) {
        return false;
      }
      if (treeSearchQuery.trim()) {
        const q = treeSearchQuery.toLowerCase();
        const docMatches = doc.titleAr.toLowerCase().includes(q) || doc.codeNumber.includes(q);
        const chapterMatches = doc.chapters?.some(ch => 
          ch.titleAr.toLowerCase().includes(q) || 
          ch.num.toLowerCase().includes(q) ||
          ch.articles?.some(art => 
            art.titleAr?.toLowerCase().includes(q) || 
            art.officialTextAr?.toLowerCase().includes(q)
          )
        );
        return docMatches || chapterMatches;
      }
      return true;
    });
  }, [selectedVolumeFilter, treeSearchQuery]);

  // Filtered occupancies for View 3
  const filteredOccupancies = useMemo(() => {
    if (!occupancySearch.trim()) return OCCUPANCY_CLASSIFICATIONS;
    const q = occupancySearch.toLowerCase();
    return OCCUPANCY_CLASSIFICATIONS.filter(occ => 
      occ.code.toLowerCase().includes(q) ||
      occ.nameAr.toLowerCase().includes(q) ||
      occ.descriptionAr.toLowerCase().includes(q) ||
      occ.subgroups?.some(s => s.code.toLowerCase().includes(q) || s.nameAr.toLowerCase().includes(q) || (s.examples && s.examples.toLowerCase().includes(q)))
    );
  }, [occupancySearch]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* Main Header & Sub-Tab Switcher */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        flexWrap: 'wrap', 
        gap: '14px',
        background: '#ffffff',
        padding: '20px 24px',
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)',
        border: '1px solid #e2e8f0'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ 
              background: '#fee2e2', 
              color: '#dc2626', 
              padding: '4px 10px', 
              borderRadius: '20px', 
              fontSize: '0.78rem', 
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <Flame size={13} />
              {isAr ? 'الكود المصري المعتمد ٢٠٢٦' : 'Egyptian Fire Code 2026'}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
              {isAr ? OFFICIAL_METADATA.decreeNumber : 'Decree No. 255/2026'}
            </span>
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
            {isAr ? 'المتصفح الكامل لكود الحريق المصري (تصفح حر)' : 'Egyptian Fire Code Official Full Browser'}
          </h1>
          <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '4px 0 0 0' }}>
            {isAr 
              ? 'تصفح نصوص الكود بالكامل، مجلد بمجلد وباباً بباب مع النصوص الرسمية المعتمدة والتفسيرات الهندسية المعتمدة.'
              : 'Freely browse the entire official code, volume by volume, chapter by chapter, with verbatim text.'}
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div style={{ 
          display: 'flex', 
          background: '#f1f5f9', 
          borderRadius: '12px', 
          padding: '5px',
          gap: '4px',
          border: '1px solid #cbd5e1',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setActiveTab('reader')}
            style={{
              background: activeTab === 'reader' ? '#dc2626' : 'transparent',
              color: activeTab === 'reader' ? '#ffffff' : '#334155',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: activeTab === 'reader' ? '0 2px 8px rgba(220, 38, 38, 0.35)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <BookOpen size={16} />
            <span>{isAr ? 'قارئ الكود الكامل (تصفح حر)' : 'Full Code Free Reader'}</span>
          </button>

          <button
            onClick={() => setActiveTab('provisions')}
            style={{
              background: activeTab === 'provisions' ? '#0f172a' : 'transparent',
              color: activeTab === 'provisions' ? '#ffffff' : '#334155',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: activeTab === 'provisions' ? '0 2px 8px rgba(15, 23, 42, 0.25)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Search size={15} />
            <span>{isAr ? 'البحث السريع بالبنود' : 'Provisions Search'}</span>
          </button>

          <button
            onClick={() => setActiveTab('classifications')}
            style={{
              background: activeTab === 'classifications' ? '#0f172a' : 'transparent',
              color: activeTab === 'classifications' ? '#ffffff' : '#334155',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: activeTab === 'classifications' ? '0 2px 8px rgba(15, 23, 42, 0.25)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Layers size={15} />
            <span>{isAr ? 'دليل الإشغالات (جدول ٢-١)' : 'Occupancies (Table 2-1)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            style={{
              background: activeTab === 'documents' ? '#0f172a' : 'transparent',
              color: activeTab === 'documents' ? '#ffffff' : '#334155',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: activeTab === 'documents' ? '0 2px 8px rgba(15, 23, 42, 0.25)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <FileText size={15} />
            <span>{isAr ? 'الوثائق والملفات الرسمية' : 'Source Documents'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* VIEW 1: FULL CODE FREE READER (وضع التصفح الحر الكامل)   */}
      {/* ========================================================= */}
      {activeTab === 'reader' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', alignItems: 'start' }}>
          
          {/* RIGHT SIDEBAR: VOLUMES & CHAPTERS TREE NAVIGATOR */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)',
            overflow: 'hidden',
            position: 'sticky',
            top: '80px',
            maxHeight: 'calc(100vh - 100px)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Sidebar Header */}
            <div style={{ 
              padding: '16px 18px', 
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
              color: '#ffffff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={18} color="#f87171" />
                  <span style={{ fontWeight: 800, fontSize: '0.94rem' }}>
                    {isAr ? 'فهرس مجلدات وأبواب الكود' : 'Code Volumes & Index'}
                  </span>
                </div>
                <span style={{ 
                  background: 'rgba(255, 255, 255, 0.15)', 
                  padding: '2px 8px', 
                  borderRadius: '12px', 
                  fontSize: '0.72rem', 
                  fontWeight: 700 
                }}>
                  {allChaptersFlat.length} {isAr ? 'باباً معتمداً' : 'Chapters'}
                </span>
              </div>

              {/* Quick Search in Index */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                background: 'rgba(255, 255, 255, 0.12)', 
                borderRadius: '8px', 
                padding: '0 8px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <Search size={14} color="#94a3b8" />
                <input
                  type="text"
                  value={treeSearchQuery}
                  onChange={(e) => setTreeSearchQuery(e.target.value)}
                  placeholder={isAr ? "ابحث في عناوين الأبواب والمجلدات..." : "Search chapters index..."}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#ffffff',
                    padding: '8px',
                    fontSize: '0.8rem',
                    outline: 'none',
                    width: '100%',
                    fontFamily: 'inherit'
                  }}
                />
                {treeSearchQuery && (
                  <button 
                    onClick={() => setTreeSearchQuery('')}
                    style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '0.75rem' }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Volume Filter Selector */}
            <div style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                {[
                  { id: 'all', label: isAr ? 'الكل' : 'All' },
                  { id: 'decree-255', label: isAr ? 'القرار ٢٥٥' : 'Decree 255' },
                  { id: 'part-1', label: isAr ? 'ج١ المعماري' : 'Part 1' },
                  { id: 'part-2', label: isAr ? 'ج٢ الميكانيكي' : 'Part 2' },
                  { id: 'part-3', label: isAr ? 'ج٣ الكهربائي' : 'Part 3' },
                  { id: 'part-classif', label: isAr ? 'جدول ٢-١' : 'Table 2-1' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedVolumeFilter(item.id)}
                    style={{
                      background: selectedVolumeFilter === item.id ? '#0f172a' : '#ffffff',
                      color: selectedVolumeFilter === item.id ? '#ffffff' : '#64748b',
                      border: '1px solid #e2e8f0',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Tree Items */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
              {visibleDocuments.map(doc => (
                <div key={doc.id} style={{ marginBottom: '14px' }}>
                  {/* Document Header Label */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '6px 8px',
                    background: '#f1f5f9',
                    borderRadius: '8px',
                    marginBottom: '6px'
                  }}>
                    <span style={{ fontWeight: 800, fontSize: '0.78rem', color: '#1e293b' }}>
                      {doc.codeNumber}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                      {doc.chapters?.length || 0} {isAr ? 'أبواب' : 'chapters'}
                    </span>
                  </div>

                  {/* Chapters under this document */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {doc.chapters?.map(ch => {
                      const isSelected = selectedDocId === doc.id && selectedChapterId === ch.id;
                      const hasArticles = (ch.articles && ch.articles.length > 0);
                      return (
                        <div
                          key={ch.id}
                          onClick={() => handleSelectChapter(doc.id, ch.id)}
                          style={{
                            padding: '9px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            background: isSelected ? '#fee2e2' : '#ffffff',
                            border: isSelected ? '1px solid #f87171' : '1px solid #f1f5f9',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ 
                              fontWeight: 800, 
                              fontSize: '0.76rem', 
                              color: isSelected ? '#b91c1c' : '#475569' 
                            }}>
                              {ch.num}
                            </span>
                            <span style={{ 
                              fontSize: '0.68rem', 
                              color: isSelected ? '#b91c1c' : '#94a3b8',
                              background: isSelected ? '#fecaca' : '#f8fafc',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              fontWeight: 700
                            }}>
                              {ch.articles?.length || 0} {isAr ? 'بنود' : 'clauses'}
                            </span>
                          </div>
                          <span style={{ 
                            fontSize: '0.8rem', 
                            fontWeight: isSelected ? 800 : 600, 
                            color: isSelected ? '#991b1b' : '#1e293b',
                            lineHeight: 1.35
                          }}>
                            {ch.titleAr}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* MAIN READER PANE (قماشة القراءة الحرة) */}
          <div ref={readerTopRef} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* Top Toolbar: Chapter Meta, Font Adjuster, Quick Jump */}
            <div style={{ 
              background: '#ffffff', 
              borderRadius: '16px', 
              padding: '16px 22px', 
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              {/* Breadcrumb Info */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                  <span style={{ color: '#dc2626', fontWeight: 800 }}>{currentDoc?.codeNumber}</span>
                  <span>/</span>
                  <span>{currentChapter?.num}</span>
                  <span>•</span>
                  <span>{isAr ? `صفحات ${currentChapter?.pages}` : `pp. ${currentChapter?.pages}`}</span>
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '4px 0 0 0' }}>
                  {currentChapter?.titleAr}
                </h2>
              </div>

              {/* Tools Controls: Search in Chapter, Font Switcher, Bookmarks Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                
                {/* Search within this Chapter */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  background: '#f8fafc', 
                  borderRadius: '8px', 
                  padding: '4px 10px', 
                  border: '1px solid #cbd5e1' 
                }}>
                  <Search size={14} color="#64748b" />
                  <input
                    type="text"
                    value={chapterFilterQuery}
                    onChange={(e) => setChapterFilterQuery(e.target.value)}
                    placeholder={isAr ? "بحث في هذا الباب..." : "Filter chapter..."}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      padding: '4px 6px',
                      fontSize: '0.78rem',
                      outline: 'none',
                      fontFamily: 'inherit',
                      width: '130px'
                    }}
                  />
                  {chapterFilterQuery && (
                    <button 
                      onClick={() => setChapterFilterQuery('')}
                      style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.7rem' }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Font Size Adjuster */}
                <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '2px', border: '1px solid #cbd5e1' }}>
                  <button 
                    onClick={() => setFontSizeLevel(0)}
                    title={isAr ? "خط أصغر" : "Smaller font"}
                    style={{ 
                      background: fontSizeLevel === 0 ? '#ffffff' : 'transparent',
                      border: 'none', 
                      padding: '4px 8px', 
                      borderRadius: '6px', 
                      fontSize: '0.72rem', 
                      fontWeight: 800,
                      cursor: 'pointer' 
                    }}
                  >
                    A-
                  </button>
                  <button 
                    onClick={() => setFontSizeLevel(1)}
                    title={isAr ? "خط قياسي" : "Standard font"}
                    style={{ 
                      background: fontSizeLevel === 1 ? '#ffffff' : 'transparent',
                      border: 'none', 
                      padding: '4px 8px', 
                      borderRadius: '6px', 
                      fontSize: '0.78rem', 
                      fontWeight: 800,
                      cursor: 'pointer' 
                    }}
                  >
                    A
                  </button>
                  <button 
                    onClick={() => setFontSizeLevel(2)}
                    title={isAr ? "خط أكبر" : "Larger font"}
                    style={{ 
                      background: fontSizeLevel === 2 ? '#ffffff' : 'transparent',
                      border: 'none', 
                      padding: '4px 8px', 
                      borderRadius: '6px', 
                      fontSize: '0.86rem', 
                      fontWeight: 800,
                      cursor: 'pointer' 
                    }}
                  >
                    A+
                  </button>
                </div>

                {/* Bookmark View Toggle */}
                {bookmarkedArticleIds.length > 0 && (
                  <button
                    onClick={() => setShowOnlyBookmarks(!showOnlyBookmarks)}
                    style={{
                      background: showOnlyBookmarks ? '#fef08a' : '#f8fafc',
                      color: showOnlyBookmarks ? '#854d0e' : '#475569',
                      border: '1px solid #cbd5e1',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Bookmark size={13} fill={showOnlyBookmarks ? '#ca8a04' : 'none'} />
                    <span>{isAr ? `المحفوظات (${bookmarkedArticleIds.length})` : `Bookmarks (${bookmarkedArticleIds.length})`}</span>
                  </button>
                )}

              </div>
            </div>

            {/* Chapter Overview Box */}
            <div style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)',
              border: '1px solid #cbd5e1',
              borderRadius: '16px',
              padding: '18px 22px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="badge badge-dark">{currentDoc?.codeNumber}</span>
                <span className="badge badge-red">{currentChapter?.num}</span>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                  {isAr ? `إجمالي بنود هذا الباب: ${currentArticles.length}` : `Articles: ${currentArticles.length}`}
                </span>
              </div>
              <p style={{ fontSize: activeFontSize.base, color: '#334155', margin: 0, lineHeight: 1.6 }}>
                <strong>{isAr ? 'نطاق وخلاصة الباب: ' : 'Chapter Scope: '}</strong>
                {currentChapter?.summaryAr || (isAr ? 'يشتمل هذا الباب على النصوص الكودية الرسمية الواجبة الاتباع.' : 'This chapter contains mandatory code provisions.')}
              </p>
            </div>

            {/* ARTICLES FEED */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {currentArticles.length === 0 ? (
                <div style={{
                  background: '#ffffff',
                  padding: '40px 20px',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  textAlign: 'center'
                }}>
                  <AlertCircle size={36} color="#94a3b8" style={{ margin: '0 auto 10px auto' }} />
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#334155' }}>
                    {isAr ? 'لا توجد بنود مطابقة لهذا البحث أو الفلتر' : 'No articles match this query'}
                  </h3>
                  <button 
                    onClick={() => { setChapterFilterQuery(''); setShowOnlyBookmarks(false); }}
                    className="btn-secondary"
                    style={{ marginTop: '12px', fontSize: '0.8rem' }}
                  >
                    {isAr ? 'إعادة ضبط الفلتر' : 'Reset Filter'}
                  </button>
                </div>
              ) : (
                currentArticles.map((art, idx) => {
                  const articleKey = `${currentChapter?.id}-${idx}`;
                  const isBookmarked = bookmarkedArticleIds.includes(articleKey);
                  return (
                    <div 
                      key={idx}
                      id={`article-${idx}`}
                      style={{
                        background: '#ffffff',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 3px 10px rgba(15, 23, 42, 0.03)',
                        padding: '20px 24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                        transition: 'border-color 0.2s ease'
                      }}
                    >
                      {/* Article Header Bar */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ 
                            background: '#0f172a', 
                            color: '#ffffff', 
                            padding: '4px 10px', 
                            borderRadius: '6px', 
                            fontSize: '0.78rem', 
                            fontWeight: 800 
                          }}>
                            {art.articleNum}
                          </span>
                          <span style={{ 
                            background: '#eff6ff', 
                            color: '#1d4ed8', 
                            padding: '3px 8px', 
                            borderRadius: '6px', 
                            fontSize: '0.74rem', 
                            fontWeight: 700 
                          }}>
                            {isAr ? `صفحة ${art.page}` : `p. ${art.page}`}
                          </span>
                        </div>

                        {/* Article Action Buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          
                          {/* Copy Text */}
                          <button
                            onClick={() => handleCopy(art.officialTextAr, articleKey)}
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              color: copiedId === articleKey ? '#16a34a' : '#475569'
                            }}
                            title={isAr ? "نسخ النص الكودي المعتمد" : "Copy verbatim text"}
                          >
                            {copiedId === articleKey ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                            <span>{copiedId === articleKey ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ النص' : 'Copy')}</span>
                          </button>

                          {/* Bookmark Toggle */}
                          <button
                            onClick={() => toggleBookmark(articleKey)}
                            style={{
                              background: isBookmarked ? '#fef9c3' : '#f8fafc',
                              border: isBookmarked ? '1px solid #facc15' : '1px solid #cbd5e1',
                              padding: '5px 8px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              color: isBookmarked ? '#ca8a04' : '#64748b'
                            }}
                            title={isAr ? "حفظ كمرجع مفضل" : "Bookmark article"}
                          >
                            <Bookmark size={14} fill={isBookmarked ? '#ca8a04' : 'none'} />
                          </button>

                          {/* Ask AI Assistant Button */}
                          {onOpenAssistant && (
                            <button
                              onClick={() => {
                                const prompt = isAr 
                                  ? `اشرح لي بالتفصيل كيفية تطبيق اشتراطات (${art.articleNum} - ${art.titleAr}) طبقاً للكود المصري لحماية المنشآت من الحريق وما هي الحالات الاستثنائية؟`
                                  : `Explain compliance criteria for (${art.articleNum} - ${art.titleAr}) under Egyptian Fire Code 2026.`;
                                onOpenAssistant(prompt);
                              }}
                              style={{
                                background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                                color: '#991b1b',
                                border: '1px solid #fca5a5',
                                padding: '5px 10px',
                                borderRadius: '6px',
                                fontSize: '0.74rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              title={isAr ? "استشارة المساعد الذكي حول هذا البند" : "Consult AI Assistant on this article"}
                            >
                              <Sparkles size={13} color="#dc2626" />
                              <span>{isAr ? 'استشارة الذكاء الاصطناعي' : 'Ask AI'}</span>
                            </button>
                          )}

                        </div>
                      </div>

                      {/* Article Title */}
                      <h3 style={{ fontSize: activeFontSize.heading, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        {art.titleAr}
                      </h3>

                      {/* Verbatim Official Quote Box */}
                      <div className="citation-box" style={{ margin: 0 }}>
                        <div className="citation-header">
                          <span style={{ fontWeight: 800 }}>
                            {isAr ? `نص الكود المصري الرسمي المعتمد بالقرار ٢٥٥ لسنة ٢٠٢٦ (${art.articleNum})` : `Official Code Text (${art.articleNum})`}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#b91c1c', fontWeight: 800 }}>
                            {isAr ? 'إلزام قانوني وهندسي' : 'Statutory Mandate'}
                          </span>
                        </div>
                        <div 
                          className="source-verbatim-text" 
                          style={{ 
                            fontSize: activeFontSize.quote, 
                            lineHeight: 1.8, 
                            color: '#0f172a',
                            fontWeight: 600
                          }}
                        >
                          « {art.officialTextAr} »
                        </div>
                      </div>

                      {/* Engineering Application Summary */}
                      {art.engineeringExplanationAr && (
                        <div style={{
                          background: '#f8fafc',
                          padding: '12px 16px',
                          borderRadius: '10px',
                          border: '1px solid #e2e8f0',
                          fontSize: activeFontSize.base,
                          lineHeight: 1.65,
                          color: '#334155'
                        }}>
                          <strong style={{ color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                            {isAr ? '💡 الشرح والتطبيق الهندسي المعتمد:' : '💡 Engineering Commentary & Compliance:'}
                          </strong>
                          {art.engineeringExplanationAr}
                        </div>
                      )}

                      {/* Key Figures & Parameter Highlights */}
                      {art.keyFigures && art.keyFigures.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b' }}>
                            {isAr ? 'المعايير الرقمية والمحددات:' : 'Key Parameters:'}
                          </span>
                          {art.keyFigures.map((fig, fi) => (
                            <span 
                              key={fi} 
                              style={{ 
                                background: '#fef3c7', 
                                color: '#92400e', 
                                border: '1px solid #fde68a',
                                fontSize: '0.75rem', 
                                fontWeight: 700, 
                                padding: '2px 8px', 
                                borderRadius: '6px' 
                              }}
                            >
                              ✓ {fig}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Tags */}
                      {art.tags && art.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {art.tags.map((tag, ti) => (
                            <span 
                              key={ti} 
                              style={{ 
                                background: '#f1f5f9', 
                                color: '#64748b', 
                                fontSize: '0.72rem', 
                                padding: '2px 7px', 
                                borderRadius: '4px' 
                              }}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Chapter Navigation Bar (السابق / التالي) */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                {prevChapterItem ? (
                  <button
                    onClick={() => handleSelectChapter(prevChapterItem.docId, prevChapterItem.chapter.id)}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#1e293b'
                    }}
                  >
                    <span>{isAr ? '⟵ الباب السابق:' : '⟵ Previous:'}</span>
                    <strong style={{ color: '#dc2626' }}>{prevChapterItem.chapter.num}</strong>
                  </button>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    {isAr ? 'أول أبواب الكود' : 'First Chapter'}
                  </span>
                )}
              </div>

              {/* Scroll to Top */}
              <button
                onClick={() => readerTopRef.current?.scrollIntoView({ behavior: 'smooth' })}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <ArrowUp size={15} />
                <span>{isAr ? 'العودة لأعلى الصفحة' : 'Scroll to Top'}</span>
              </button>

              <div>
                {nextChapterItem ? (
                  <button
                    onClick={() => handleSelectChapter(nextChapterItem.docId, nextChapterItem.chapter.id)}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#1e293b'
                    }}
                  >
                    <span>{isAr ? 'الباب التالي ⟶:' : 'Next Chapter ⟶:'}</span>
                    <strong style={{ color: '#dc2626' }}>{nextChapterItem.chapter.num}</strong>
                  </button>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    {isAr ? 'نهاية أبواب الكود' : 'Last Chapter'}
                  </span>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 2: PROVISIONS SEARCH (البحث الفوري بالبنود)           */}
      {/* ========================================================= */}
      {activeTab === 'provisions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Search Box & Filters */}
          <div className="card" style={{ padding: '18px 24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)', padding: '0 12px' }}>
                <Search size={18} color="#64748b" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isAr ? "ابحث بنص الكلمة، رقم البند (مثال ٥-١ أو ٢-٢)، أو الموضوع (رشاشات، مسالك هروب، جراج)..." : "Search by keyword, article number (e.g. 5-1), or topic..."}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    padding: '12px 10px',
                    fontSize: '0.92rem',
                    fontFamily: 'inherit',
                    color: '#0f172a'
                  }}
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
                  >
                    ✕
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>
                    <Filter size={14} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '4px' }} />
                    {isAr ? 'تصفية حسب الجزء:' : 'Filter by Part:'}
                  </span>

                  <select
                    value={selectedDocFilter}
                    onChange={(e) => setSelectedDocFilter(e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontFamily: 'inherit' }}
                  >
                    <option value="all">{isAr ? 'جميع الأجزاء الرسمية' : 'All Official Parts'}</option>
                    <option value="part-1">{isAr ? 'الجزء الأول: المتطلبات البنائية (٣٠٥/١)' : 'Part 1: Architectural'}</option>
                    <option value="part-2">{isAr ? 'الجزء الثاني: الأنظمة الميكانيكية (٣٠٥/٢)' : 'Part 2: Mechanical'}</option>
                    <option value="part-3">{isAr ? 'الجزء الثالث: المتطلبات الكهربائية والإنذار (٣٠٥/٣)' : 'Part 3: Electrical & Alarm'}</option>
                  </select>

                  <select
                    value={selectedEditionFilter}
                    onChange={(e) => setSelectedEditionFilter(e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontFamily: 'inherit', fontWeight: 600, color: '#b91c1c' }}
                  >
                    <option value="2026">{isAr ? 'إصدار ٢٠٢٦ الحالي (قرار ٢٥٥)' : '2026 Current Edition'}</option>
                    <option value="all">{isAr ? 'كافة الإصدارات والملاحق' : 'All Editions & Annexes'}</option>
                    <option value="1998" disabled>{isAr ? 'إصدار ١٩٩٨ (ملغى رسمياً)' : '1998 Superseded (Void)'}</option>
                  </select>
                </div>

                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {isAr ? `عدد النتائج المطابقة: ${filteredProvisions.length}` : `Matches: ${filteredProvisions.length}`}
                </div>
              </div>
            </div>
          </div>

          {/* Results List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredProvisions.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}>
                <AlertCircle size={40} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155' }}>
                  {isAr ? 'لا توجد نصوص كودية مطابقة للبحث' : 'No matching code provisions found'}
                </h3>
              </div>
            ) : (
              filteredProvisions.map((prov) => (
                <div key={prov.id} className="card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="badge badge-dark">
                        {prov.documentId === 'part-1' ? 'كود ٣٠٥/١' : prov.documentId === 'part-2' ? 'كود ٣٠٥/٢' : 'كود ٣٠٥/٣'}
                      </span>
                      <span className="badge badge-amber">
                        {isAr ? `إصدار ${prov.edition}` : `Edition ${prov.edition}`}
                      </span>
                      <span className="badge badge-blue">
                        {prov.articleNum}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                        {isAr ? `صفحة ${prov.page}` : `p. ${prov.page}`}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopy(prov.sourceTextAr, prov.id)}
                      className="btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      title={isAr ? 'نسخ النص الكودي المعتمد' : 'Copy exact code text'}
                    >
                      {copiedId === prov.id ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                      {copiedId === prov.id ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ النص' : 'Copy Text')}
                    </button>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
                    {isAr ? prov.subjectAr : prov.subjectEn}
                  </h3>

                  <div className="citation-box" style={{ margin: '10px 0' }}>
                    <div className="citation-header">
                      <span>{prov.chapterNameAr}</span>
                      <span style={{ fontSize: '0.74rem', color: '#dc2626', fontWeight: 700 }}>
                        {isAr ? 'نص الكود الرسمي الصادر بقرار ٢٥٥ لسنة ٢٠٢٦' : 'Official Code Text'}
                      </span>
                    </div>
                    <div className="source-verbatim-text">
                      « {prov.sourceTextAr} »
                    </div>
                  </div>

                  <div style={{ marginTop: '10px', fontSize: '0.86rem', color: '#334155', background: '#f8fafc', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                    <strong style={{ color: '#0f172a' }}>{isAr ? 'الشرح الهندسي المبسط: ' : 'Plain Language Summary: '}</strong>
                    {prov.plainExplanationAr}
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px' }}>
                    {prov.tags.map((tag, i) => (
                      <span key={i} style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.74rem', padding: '2px 8px', borderRadius: '4px' }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 3: TABLE 2-1 OCCUPANCY CLASSIFICATIONS               */}
      {/* ========================================================= */}
      {activeTab === 'classifications' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ 
            padding: '16px 20px', 
            background: '#eff6ff', 
            borderRadius: '16px', 
            border: '1px solid #bfdbfe', 
            fontSize: '0.88rem', 
            color: '#1e40af',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <strong>{isAr ? 'المرجع الرسمي المعتمد: ' : 'Official Reference: '}</strong>
              {isAr 
                ? 'الجدول رقم (٢-١): تصنيف المباني طبقاً للإشغالات الرئيسية والمجموعات الفرعية - الكود المصري لحماية المنشآت من الحريق رقم (٣٠٥/١) - إصدار ٢٠٢٦.'
                : 'Table (2-1): Building Occupancy Classification & Subgroups - Egyptian Fire Code (305/1) - 2026 Edition.'}
            </div>

            {/* Occupancy quick search */}
            <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', borderRadius: '8px', padding: '4px 10px', border: '1px solid #93c5fd' }}>
              <Search size={14} color="#3b82f6" />
              <input
                type="text"
                value={occupancySearch}
                onChange={(e) => setOccupancySearch(e.target.value)}
                placeholder={isAr ? "ابحث في الإشغالات (أ، ب، تجاري، جراج)..." : "Filter occupancies..."}
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: '4px 8px',
                  fontSize: '0.8rem',
                  outline: 'none',
                  fontFamily: 'inherit',
                  width: '200px'
                }}
              />
              {occupancySearch && (
                <button onClick={() => setOccupancySearch('')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.75rem', color: '#64748b' }}>✕</button>
              )}
            </div>
          </div>

          {filteredOccupancies.map((occ) => (
            <div key={occ.code} className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
                <span style={{ 
                  width: '38px', 
                  height: '38px', 
                  borderRadius: '10px', 
                  background: '#fee2e2', 
                  color: '#dc2626', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: 900,
                  fontSize: '1.2rem',
                  boxShadow: '0 2px 6px rgba(220, 38, 38, 0.2)'
                }}>
                  {occ.code}
                </span>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {isAr ? occ.nameAr : occ.nameEn}
                  </h3>
                  <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '2px 0 0 0' }}>
                    {occ.descriptionAr}
                  </p>
                </div>
              </div>

              {occ.subgroups && (
                <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {occ.subgroups.map((sub, i) => (
                    <div key={i} style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.84rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span className="badge badge-dark" style={{ fontSize: '0.74rem' }}>{sub.code}</span>
                        <strong style={{ color: '#1e293b' }}>{sub.nameAr}</strong>
                      </div>
                      {sub.examples && (
                        <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px' }}>
                          <strong style={{ color: '#0f172a' }}>{isAr ? 'أمثلة مدرجة بالكود المعتمد: ' : 'Official examples: '}</strong>
                          {sub.examples}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 4: OFFICIAL DOCUMENTS & SCANNED PDF SOURCES          */}
      {/* ========================================================= */}
      {activeTab === 'documents' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {SOURCE_DOCUMENTS.map((doc) => (
            <div key={doc.id} className="card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span className="badge badge-dark" style={{ fontSize: '0.85rem' }}>
                      {doc.codeNumber}
                    </span>
                    <span className="badge badge-green">
                      {isAr ? 'ساري وواجب النفاذ' : 'Active & Statutory'}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                      {doc.pages} {isAr ? 'صفحة' : 'pages'} • {doc.sizeMB}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                    {isAr ? doc.titleAr : doc.titleEn}
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '4px' }}>
                    📄 {isAr ? `الملف المصدري: ${doc.filename}` : `Source File: ${doc.filename}`}
                  </div>
                </div>

                <div style={{ textAlign: isAr ? 'left' : 'right' }}>
                  <span className="badge badge-amber" style={{ fontSize: '0.76rem' }}>
                    {doc.processingStatus}
                  </span>
                </div>
              </div>

              {/* Chapters list */}
              <div style={{ marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '10px' }}>
                  {isAr ? 'فهرس الأبواب والفصول المعتمدة:' : 'Chapters Index:'}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {doc.chapters?.map((ch) => (
                    <div 
                      key={ch.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: '#f8fafc',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.86rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <strong style={{ color: '#dc2626' }}>{ch.num}</strong>
                        <span style={{ color: '#1e293b' }}>{ch.titleAr}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.74rem', color: '#475569', background: '#ffffff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                          {ch.articles?.length || 0} {isAr ? 'بنود' : 'clauses'}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          {isAr ? `صفحات ${ch.pages}` : `pp. ${ch.pages}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
