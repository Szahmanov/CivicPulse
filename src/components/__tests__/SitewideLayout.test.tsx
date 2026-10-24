import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SitewideLayout from '../SitewideLayout';

// Helper: renders the layout with optional children and props
function renderLayout(
  children: React.ReactNode = <p>Page content</p>,
  props: { snapshotDate?: string } = {}
) {
  return render(<SitewideLayout {...props}>{children}</SitewideLayout>);
}

// ---------------------------------------------------------------------------
// Group 1: Safety banner and disclaimer
// ---------------------------------------------------------------------------
describe('Safety banner and disclaimer', () => {
  it('renders the sitewide safety banner with correct text', () => {
    renderLayout();
    // The text appears in both the sticky banner and the footer — assert at least one match
    const matches = screen.getAllByText(
      /CivicPulse is not an official City of Boston service/i
    );
    expect(matches.length).toBeGreaterThan(0);
  });

  it('renders the no-decisions disclaimer text', () => {
    renderLayout();
    // The text appears in both the sticky banner and the footer — assert at least one match
    const matches = screen.getAllByText(
      /does not make enforcement, benefit, emergency, or eligibility decisions/i
    );
    expect(matches.length).toBeGreaterThan(0);
  });

  it('banner has role="banner"', () => {
    renderLayout();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Group 2: Navigation
// ---------------------------------------------------------------------------
describe('Navigation', () => {
  it('renders navigation with aria-label="Main navigation"', () => {
    renderLayout();
    expect(
      screen.getByRole('navigation', { name: 'Main navigation' })
    ).toBeInTheDocument();
  });

  it('renders Dashboard navigation link', () => {
    renderLayout();
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('renders Preparedness navigation link', () => {
    renderLayout();
    expect(screen.getByRole('link', { name: 'Preparedness' })).toBeInTheDocument();
  });

  it('renders Data & Limitations navigation link', () => {
    renderLayout();
    expect(
      screen.getByRole('link', { name: 'Data & Limitations' })
    ).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Group 3: Skip-to-main link
// ---------------------------------------------------------------------------
describe('Skip-to-main link', () => {
  it('renders skip-to-main link with correct href', () => {
    const { container } = renderLayout();
    const skip = container.querySelector('a[href="#main-content"]');
    expect(skip).not.toBeNull();
    expect(skip).toHaveTextContent('Skip to main content');
  });

  it('main content area has id="main-content"', () => {
    const { container } = renderLayout();
    expect(container.querySelector('#main-content')).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Group 4: Footer external links — MA 211
// ---------------------------------------------------------------------------
describe('Footer external links — MA 211', () => {
  it('MA 211 link has correct href', () => {
    const { container } = renderLayout();
    const footer = container.querySelector('footer')!;
    const link = footer.querySelector('a[href*="mass211.org"]');
    expect(link).not.toBeNull();
  });

  it('MA 211 link opens in new tab', () => {
    const { container } = renderLayout();
    const footer = container.querySelector('footer')!;
    const link = footer.querySelector('a[href*="mass211.org"]')!;
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('MA 211 link has rel="noopener noreferrer"', () => {
    const { container } = renderLayout();
    const footer = container.querySelector('footer')!;
    const link = footer.querySelector('a[href*="mass211.org"]')!;
    const rel = link.getAttribute('rel') ?? '';
    expect(rel).toContain('noopener');
    expect(rel).toContain('noreferrer');
  });

  it('MA 211 link has descriptive aria-label', () => {
    const { container } = renderLayout();
    const footer = container.querySelector('footer')!;
    const link = footer.querySelector('a[href*="mass211.org"]')!;
    const ariaLabel = link.getAttribute('aria-label') ?? '';
    expect(ariaLabel).not.toBe('');
    expect(ariaLabel.toLowerCase()).not.toBe('click here');
  });

  it('MA 211 link has descriptive visible text', () => {
    const { container } = renderLayout();
    const footer = container.querySelector('footer')!;
    const link = footer.querySelector('a[href*="mass211.org"]')!;
    const text = (link.textContent ?? '').trim();
    expect(text).not.toBe('');
    expect(text.toLowerCase()).not.toBe('click here');
  });
});

// ---------------------------------------------------------------------------
// Group 5: Footer data source links
// ---------------------------------------------------------------------------
describe('Footer data source links', () => {
  it('Boston 311 data source link is present', () => {
    const { container } = renderLayout();
    const footer = container.querySelector('footer')!;
    const link =
      footer.querySelector('a[href*="data.boston.gov"]') ??
      Array.from(footer.querySelectorAll('a')).find(
        (a) => a.textContent?.includes('Boston 311 Open Data')
      );
    expect(link).not.toBeNull();
  });

  it('FEMA data source link is present', () => {
    const { container } = renderLayout();
    const footer = container.querySelector('footer')!;
    const link =
      footer.querySelector('a[href*="fema.gov"]') ??
      Array.from(footer.querySelectorAll('a')).find(
        (a) => a.textContent?.includes('FEMA Disaster Declarations')
      );
    expect(link).not.toBeNull();
  });

  it('EJ data source link is present', () => {
    const { container } = renderLayout();
    const footer = container.querySelector('footer')!;
    const link =
      footer.querySelector('a[href*="mass.gov"]') ??
      Array.from(footer.querySelectorAll('a')).find(
        (a) => a.textContent?.includes('MA Environmental Justice Data')
      );
    expect(link).not.toBeNull();
  });

  it('all footer links open in new tab', () => {
    const { container } = renderLayout();
    const footer = container.querySelector('footer')!;
    const links = Array.from(footer.querySelectorAll('a'));
    expect(links.length).toBeGreaterThan(0);
    links.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank');
    });
  });

  it('all footer links have rel="noopener noreferrer"', () => {
    const { container } = renderLayout();
    const footer = container.querySelector('footer')!;
    const links = Array.from(footer.querySelectorAll('a'));
    expect(links.length).toBeGreaterThan(0);
    links.forEach((link) => {
      const rel = link.getAttribute('rel') ?? '';
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
    });
  });
});

// ---------------------------------------------------------------------------
// Group 6: Snapshot date
// ---------------------------------------------------------------------------
describe('Snapshot date', () => {
  it('renders snapshot date in footer', () => {
    renderLayout(<p>content</p>, { snapshotDate: '2024-01-15' });
    expect(
      screen.getByText(/Sample data snapshot: 2024-01-15/)
    ).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Group 7: Children
// ---------------------------------------------------------------------------
describe('Children', () => {
  it('renders children inside main', () => {
    const { container } = renderLayout(<p>Test content</p>);
    const main = container.querySelector('main#main-content')!;
    expect(within(main).getByText('Test content')).toBeInTheDocument();
  });
});
