import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col } from 'react-bootstrap';
import axiosClient from '../../api/axiosClient';
import AppShell from '../../components/AppShell';
import SchemeCard from '../../components/SchemeCard';
import PageHeader from '../../components/common/PageHeader';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { Search, RotateCcw, Filter } from 'lucide-react';

const SchemeList = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [incomeFilter, setIncomeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');

  useEffect(() => {
    const fetchSchemes = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axiosClient.get('/schemes?active=true');
        setSchemes(res.data.schemes || []);
      } catch (e) {
        setSchemes([]);
        setError(e.response?.data?.message || 'Could not load official schemes from server.');
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();
  }, []);

  // Filtered and Sorted Schemes
  const filteredSchemes = useMemo(() => {
    return schemes.filter((s) => {
      // Search
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = s.name?.toLowerCase().includes(term);
        const matchesCode = s.code?.toLowerCase().includes(term);
        const matchesDesc = s.description?.toLowerCase().includes(term);
        if (!matchesName && !matchesCode && !matchesDesc) return false;
      }

      // Education Level
      if (levelFilter !== 'all') {
        const lvl = (s.level || s.eligibilityRules?.educationLevel || '').toLowerCase();
        if (levelFilter === '10th' && !lvl.includes('10th')) return false;
        if (levelFilter === '12th' && !lvl.includes('12th')) return false;
        if (levelFilter === 'bachelors' && !lvl.includes('bachelor') && !lvl.includes('undergraduate')) return false;
        if (levelFilter === 'masters' && !lvl.includes('master')) return false;
        if (levelFilter === 'phd' && !lvl.includes('phd') && !lvl.includes('mphil')) return false;
      }

      // Scheme Type
      if (typeFilter !== 'all') {
        const type = (s.schemeType || s.category || '').toLowerCase();
        if (typeFilter === 'central' && !type.includes('central')) return false;
        if (typeFilter === 'overseas' && !type.includes('overseas') && !s.code?.includes('AZKMI')) return false;
      }

      // Income limit
      if (incomeFilter !== 'all') {
        let maxIncome = Infinity;
        if (typeof s.incomeLimitMax === 'number') maxIncome = s.incomeLimitMax;
        else if (Array.isArray(s.eligibilityRules)) {
          const rule = s.eligibilityRules.find(r => r.field === 'familyIncome');
          if (rule && typeof rule.value === 'number') maxIncome = rule.value;
        }

        if (incomeFilter === 'under25' && maxIncome > 250000) return false;
        if (incomeFilter === 'under60' && maxIncome > 600000) return false;
        if (incomeFilter === 'under80' && maxIncome > 800000) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'name-desc') return (b.name || '').localeCompare(a.name || '');
      return 0;
    });
  }, [schemes, searchTerm, levelFilter, typeFilter, incomeFilter, sortBy]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setLevelFilter('all');
    setTypeFilter('all');
    setIncomeFilter('all');
    setSortBy('name-asc');
  };

  return (
    <AppShell>
      <PageHeader
        category="National Scheme Directory"
        title="Scholarships and Fellowships for You"
        subtitle="Browse and filter all open Ministry of Tribal Affairs higher education and research schemes."
        breadcrumbs={[{ label: 'Schemes & Fellowships' }]}
      />

      {/* Filter and Search Panel */}
      <div className="civic-card p-3 mb-4">
        <Row className="g-3 align-items-center">
          <Col lg={4} md={6}>
            <div className="civic-input-group">
              <Search size={16} className="civic-input-prefix" />
              <input
                type="text"
                className="civic-input civic-input-with-prefix"
                placeholder="Search scheme name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search schemes by name or code"
              />
            </div>
          </Col>

          <Col lg={2} sm={6}>
            <select
              className="civic-select"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              aria-label="Filter by Education Level"
            >
              <option value="all">All Education Levels</option>
              <option value="10th">Class 9th &amp; 10th (Pre-Matric)</option>
              <option value="12th">Class 11th &amp; 12th / Diploma</option>
              <option value="bachelors">Undergraduate / Degree</option>
              <option value="masters">Master's Level</option>
              <option value="phd">Ph.D. / M.Phil Fellowships</option>
            </select>
          </Col>

          <Col lg={2} sm={6}>
            <select
              className="civic-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Filter by Scheme Type"
            >
              <option value="all">All Scheme Types</option>
              <option value="central">Central Sector Schemes</option>
              <option value="overseas">Overseas Fellowship</option>
            </select>
          </Col>

          <Col lg={2} sm={6}>
            <select
              className="civic-select"
              value={incomeFilter}
              onChange={(e) => setIncomeFilter(e.target.value)}
              aria-label="Filter by Income Limit"
            >
              <option value="all">Any Income Limit</option>
              <option value="under25">≤ ₹2.5 Lakhs</option>
              <option value="under60">≤ ₹6.0 Lakhs</option>
              <option value="under80">≤ ₹8.0 Lakhs</option>
            </select>
          </Col>

          <Col lg={2} md={6} className="d-flex align-items-center justify-content-between gap-2">
            <span className="small text-secondary fw-semibold">
              {filteredSchemes.length} {filteredSchemes.length === 1 ? 'Scheme' : 'Schemes'}
            </span>
            {(searchTerm || levelFilter !== 'all' || typeFilter !== 'all' || incomeFilter !== 'all') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn btn-sm btn-link text-decoration-none p-0 text-primary d-inline-flex align-items-center gap-1"
              >
                <RotateCcw size={12} /> Reset
              </button>
            )}
          </Col>
        </Row>
      </div>

      {/* Results or Loading */}
      {error && <ErrorState message={error} onRetry={() => window.location.reload()} />}

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : filteredSchemes.length === 0 ? (
        <EmptyState
          title="No schemes found"
          description="There are currently no scholarship schemes matching the selected filter criteria. Try clearing some filters or searching for a different term."
          actionText="Reset All Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <Row className="g-4">
          {filteredSchemes.map((scheme) => (
            <Col lg={4} md={6} key={scheme._id || scheme.code}>
              <SchemeCard scheme={scheme} />
            </Col>
          ))}
        </Row>
      )}
    </AppShell>
  );
};

export default SchemeList;
