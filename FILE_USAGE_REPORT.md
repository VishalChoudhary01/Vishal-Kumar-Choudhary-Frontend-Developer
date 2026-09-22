# File Usage Report

**Portfolio — Vishal Kumar Choudhary**
*Generated: September 16, 2026*

> Every source file in `src/` with its size, line count, import references, and usage status.

---

## Summary

| Metric | Value |
|--------|-------|
| Total source files | 178 |
| Total size | ~410 KB |
| Used files | 165 |
| **Unused files** | **13** |
| Unused size | ~43 KB |

---

## UNUSED FILES (Not imported anywhere)

These files are never imported by any other source file and can be safely removed.

| # | File | Size | Lines | Why unused |
|---|------|------|-------|------------|
| 1 | `src/app/data/portfolio_copyold.js` | 30.5 KB | 742 | Old backup of portfolio.js — superseded |
| 2 | `src/app/components/common/buttons/SendButton.js` | 19.8 KB | 620 | Not imported anywhere — dead code |
| 3 | `src/app/components/sections/SomeComponent.js` | 1.5 KB | 36 | Dev scratch file — exported from index but never imported |
| 4 | `src/app/store/index.js` | 193 B | 9 | Redux store — replaced by MobileMenuProvider |
| 5 | `src/app/store/slices/uiSlice.js` | 536 B | 17 | Redux slice — replaced by MobileMenuProvider |
| 6 | `src/app/components/ui/LazyImage.js` | 3.4 KB | 111 | Created but never imported by any component |
| 7 | `src/app/components/common/logo/LightModeLogo.js` | 4.4 KB | 160 | Not imported anywhere |
| 8 | `src/app/components/common/logo/CircularV.js` | 10.5 KB | 334 | Not imported anywhere |
| 9 | `src/app/components/errors/instrumentation.js` | 982 B | 30 | Not imported anywhere |
| 10 | `src/app/components/motion/action-swap.js` | 1.8 KB | 52 | Only referenced in .md docs, never in code |
| 11 | `src/app/components/project-detail/hero/ProjectHeroActions.js` | 2.2 KB | 68 | Not imported anywhere |
| 12 | `src/app/lib/resend.js` | 673 B | 17 | Imported by API route only (server-side, separate bundle) |
| 13 | `src/app/components/project-detail/body/design/ProjectDesignBody.js` | 502 B | 15 | Not imported anywhere |

**Total unused: ~76 KB / 2,091 lines**

---

## ALL FILES — Sorted by size (descending)

### Tier 1: Large Files (>10 KB)

| File | Size | Lines | References | Status |
|------|------|-------|------------|--------|
| `src/app/data/projectsData.js` | 33.9 KB | 909 | 2+ (portfolio.js, page) | ✅ Used |
| `src/app/data/portfolio_copyold.js` | 30.5 KB | 742 | 0 | ❌ **UNUSED** |
| `src/app/components/sections/hero_comp/CinematicHero.js` | 24.3 KB | 854 | 1 (HeroSection) | ✅ Used |
| `src/app/components/common/buttons/SendButton.js` | 19.8 KB | 620 | 0 | ❌ **UNUSED** |
| `src/app/components/layout/MobileMenu.js` | 19.2 KB | 590 | 1 (Navbar) | ✅ Used |
| `src/app/components/sections/experience_comp/ExperienceCompanySelector.js` | 15.4 KB | 426 | 1 (ExperienceSection) | ✅ Used |
| `src/app/components/sections/ExperienceSection.js` | 13.0 KB | 297 | 1 (page.js) | ✅ Used |
| `src/app/globals.css` | 12.9 KB | 446 | 1 (layout.js) | ✅ Used |
| `src/app/hooks/useThemeToggle.js` | 12.8 KB | 648 | 1 (ThemeToggle) | ✅ Used |
| `src/app/components/layout/Navbar.js` | 12.6 KB | 431 | 1 (page.js) | ✅ Used |
| `src/app/components/sections/ProjectsSection.js` | 12.5 KB | 332 | 1 (page.js) | ✅ Used |
| `src/app/components/sections/Intro_loader/portfolioIntro.js` | 12.4 KB | 573 | 1 (page.js) | ✅ Used |
| `src/app/components/sections/projects_comp/ProjectPresentation.js` | 11.9 KB | 363 | 1 (ProjectRenderer) | ✅ Used |
| `src/app/data/portfolio.js` | 10.9 KB | 221 | 10+ | ✅ Used |
| `src/app/components/sections/projects_comp/ProjectMedia.js` | 10.8 KB | 343 | 1 (ProjectPresentation) | ✅ Used |
| `src/app/components/common/logo/CircularV.js` | 10.5 KB | 334 | 0 | ❌ **UNUSED** |

### Tier 2: Medium Files (5–10 KB)

| File | Size | Lines | References | Status |
|------|------|-------|------------|--------|
| `src/app/lib/motion/projectPresets.js` | 10.0 KB | 361 | 3+ | ✅ Used |
| `src/app/components/common/AnimatedOutlineText.js` | 8.9 KB | 302 | 2+ | ✅ Used |
| `src/app/components/common/logo/TwoRingLogo.js` | 8.7 KB | 356 | 1 (logo/index) | ✅ Used |
| `src/app/components/errors/ErrorPage.js` | 8.1 KB | 146 | 3 (error pages) | ✅ Used |
| `src/app/components/sections/contact_comp/contact_form/ContactProjectType.js` | 7.8 KB | 230 | 1 (ContactForm) | ✅ Used |
| `src/app/components/sections/contact_comp/contact_form/ContactField.js` | 7.8 KB | 279 | 1 (ContactFormFields) | ✅ Used |
| `src/app/components/sections/projects_comp/ProjectCategoryNav.js` | 7.5 KB | 314 | 1 (ProjectsSection) | ✅ Used |
| `src/app/components/sections/skills_comp/SkillCategory.js` | 6.3 KB | 229 | 1 (SkillsSection) | ✅ Used |
| `src/app/components/common/buttons/dounload_button_comp/DownloadButton.js` | 6.3 KB | 246 | 1 (DownloadButton) | ✅ Used |
| `src/app/components/sections/about_comp/AboutCapabilityCard.js` | 6.1 KB | 191 | 1 (AboutCapabilities) | ✅ Used |
| `src/app/components/common/buttons/DownloadButton.js` | 6.1 KB | 241 | 2 (MobileMenu, SomeComponent) | ✅ Used |
| `src/app/components/common/buttons/ActionButton.js` | 5.7 KB | 201 | 2 (Navbar, SomeComponent) | ✅ Used |
| `src/app/components/sections/skills_comp/SkillPrimary.js` | 5.6 KB | 180 | 1 (SkillCategory) | ✅ Used |
| `src/app/components/project-detail/hero/ProjectHero.js` | 5.6 KB | 131 | 1 (ProjectDetail) | ✅ Used |
| `src/app/components/errors/ErrorDiagnostics.js` | 5.6 KB | 123 | 1 (ErrorPage) | ✅ Used |
| `src/app/components/sections/Intro_loader/SurfaceSVG.js` | 5.6 KB | 168 | 1 (portfolioIntro) | ✅ Used |
| `src/app/components/sections/contact_comp/ContactForm.js` | 5.4 KB | 172 | 1 (ContactSection) | ✅ Used |
| `src/app/components/sections/hero_comp/DrawnTitle.js` | 5.4 KB | 205 | 1 (CinematicHero) | ✅ Used |
| `src/app/components/ui/Icons.js` | 5.1 KB | 101 | 10+ | ✅ Used |
| `src/app/lib/contactEmail.js` | 5.1 KB | 137 | 2 (API, contact) | ✅ Used |
| `src/app/components/ui/success_modal_comp/SuccessModalContent.js` | 5.1 KB | 116 | 1 (SuccessModal) | ✅ Used |
| `src/app/components/ui/HamburgerSVGButton.js` | 4.9 KB | 141 | 2 (Navbar, MobileMenu) | ✅ Used |
| `src/app/components/sections/contact_comp/ContactFormFields.js` | 4.9 KB | 126 | 1 (ContactForm) | ✅ Used |
| `src/app/components/sections/EducationSection.js` | 4.9 KB | 142 | 1 (page.js) | ✅ Used |
| `src/app/data/experienceData.js` | 4.8 KB | 120 | 1 (portfolio.js) | ✅ Used |
| `src/app/components/sections/experience_comp/ExperienceDetailTabs.js` | 4.6 KB | 149 | 1 (ExperienceSection) | ✅ Used |
| `src/app/components/sections/hero_comp/heroMotionConfig.js` | 4.5 KB | 208 | 3+ | ✅ Used |
| `src/app/components/sections/contact_comp/ContactDirectEmail.js` | 4.5 KB | 142 | 1 (ContactSection) | ✅ Used |
| `src/app/components/common/logo/LightModeLogo.js` | 4.4 KB | 160 | 0 | ❌ **UNUSED** |
| `src/app/components/layout/Footer.js` | 4.3 KB | 120 | 1 (layout.js) | ✅ Used |
| `src/app/components/sections/about_comp/AboutReduced.js` | 4.2 KB | 134 | 1 (aboutSection) | ✅ Used |
| `src/app/providers/PageLoaderProvider.js` | 4.2 KB | 140 | 3+ | ✅ Used |
| `src/app/components/sections/skills_comp/SkillIcon.js` | 4.1 KB | 104 | 1 (SkillPrimary) | ✅ Used |
| `src/app/components/ui/EditorialCta.js` | 4.1 KB | 135 | 2+ | ✅ Used |
| `src/app/components/layout/DesktopNavigation/NavGroup.js` | 4.0 KB | 108 | 1 (DesktopNavigation) | ✅ Used |
| `src/app/hooks/useDownload.js` | 3.9 KB | 147 | 1 (MobileMenu) | ✅ Used |
| `src/app/components/common/logo/VKrLogo.js` | 3.9 KB | 160 | 1 (logo/index) | ✅ Used |
| `src/app/data/skillsData.js` | 3.9 KB | 141 | 1 (portfolio.js) | ✅ Used |
| `src/app/components/sections/SkillsSection.js` | 3.8 KB | 106 | 1 (page.js) | ✅ Used |
| `src/app/components/sections/education_comp/EducationIntro.js` | 3.7 KB | 102 | 1 (EducationSection) | ✅ Used |
| `src/app/components/common/HeroAmbientBackground.js` | 3.6 KB | 119 | 1 (CinematicHero) | ✅ Used |
| `src/app/components/ui/ThemeToggle.js` | 3.6 KB | 104 | 1 (Navbar) | ✅ Used |
| `src/app/components/ui/SuccessModal.js` | 3.6 KB | 128 | 1 (ContactForm) | ✅ Used |
| `src/app/api/contact/route.js` | 3.6 KB | 128 | server-only | ✅ Used |
| `src/app/components/sections/skills_comp/skillsData.js` | 3.6 KB | 134 | 1 (skillsData.js) | ✅ Used |
| `src/app/components/project-detail/showcase/ProjectShowcaseMedia.js` | 3.5 KB | 104 | 1 (ProjectShowcaseGrid) | ✅ Used |
| `src/app/components/sections/projects_comp/ProjectActions.js` | 3.5 KB | 96 | 1 (ProjectPresentation) | ✅ Used |
| `src/app/components/sections/Intro_loader/IntroLetters.js` | 3.5 KB | 104 | 1 (portfolioIntro) | ✅ Used |
| `src/app/components/ui/LazyImage.js` | 3.4 KB | 111 | 0 | ❌ **UNUSED** |

### Tier 3: Small Files (2–5 KB)

| File | Size | Lines | References | Status |
|------|------|-------|------------|--------|
| `src/app/components/common/buttons/dounload_button_comp/DownloadButtonContent.js` | 3.3 KB | 98 | 1 (DownloadButton) | ✅ Used |
| `src/app/components/errors/error-utils.js` | 3.3 KB | 113 | 1 (ErrorPage) | ✅ Used |
| `src/app/components/project-detail/hero/ProjectHeroVisual.js` | 3.2 KB | 88 | 1 (ProjectHero) | ✅ Used |
| `src/app/components/common/projectHeroBackground/ProjectHeroAmbient.js` | 3.1 KB | 112 | 1 (project pages) | ✅ Used |
| `src/app/components/common/section_heading_comp/SectionHeadingLabel.js` | 3.1 KB | 86 | 1 (SectionHeading) | ✅ Used |
| `src/app/components/layout/footer_comp/FooterSocialButton.js` | 3.1 KB | 84 | 1 (FooterSocials) | ✅ Used |
| `src/app/components/project-detail/navigation/ProjectNavigation.js` | 3.1 KB | 84 | 1 (ProjectDetail) | ✅ Used |
| `src/app/components/project-detail/ProjectDetail.js` | 3.1 KB | 80 | 1 (page.js) | ✅ Used |
| `src/app/components/project-detail/showcase/ProjectShowcase.js` | 3.0 KB | 82 | 1 (ProjectDetail) | ✅ Used |
| `src/app/components/project-detail/showcase/ProjectShowcaseTile.js` | 3.0 KB | 86 | 1 (ProjectShowcaseGrid) | ✅ Used |
| `src/app/components/project-detail/body/responsive/ProjectResponsive.js` | 3.0 KB | 84 | 1 (ProjectDetail) | ✅ Used |
| `src/app/components/common/SectionHeading.js` | 3.0 KB | 82 | 6+ | ✅ Used |
| `src/app/components/motion/MotionNumber/MotionNumber.js` | 3.0 KB | 82 | 1+ | ✅ Used |
| `src/app/components/project-detail/body/engineering/ProjectEngineering.js` | 3.0 KB | 80 | 1 (ProjectDetail) | ✅ Used |
| `src/app/components/project-detail/showcase/ProjectShowcaseGrid.js` | 3.0 KB | 76 | 1 (ProjectShowcase) | ✅ Used |
| `src/app/components/project-detail/body/motion/ProjectMotion.js` | 2.9 KB | 76 | 1 (ProjectDetail) | ✅ Used |
| `src/app/projects/[slug]/page.js` | 2.7 KB | 74 | server-only | ✅ Used |
| `src/app/components/sections/hero_comp/ReducedMotionHero.js` | 2.7 KB | 76 | 1 (HeroSection) | ✅ Used |
| `src/app/components/sections/contact_comp/contactForm.validation.js` | 2.6 KB | 74 | 2 | ✅ Used |
| `src/app/components/sections/experience_comp/ExperienceWatermark.js` | 2.6 KB | 72 | 1 (ExperienceSection) | ✅ Used |
| `src/app/components/project-detail/body/reflection/ProjectReflection.js` | 2.6 KB | 68 | 1 (ProjectDetail) | ✅ Used |
| `src/app/components/common/section_heading_comp/SectionHeadingDatum.js` | 2.6 KB | 70 | 1 (SectionHeading) | ✅ Used |
| `src/app/components/project-detail/body/reflection/ProjectReflectionWorked.js` | 2.5 KB | 66 | 1 (ProjectReflection) | ✅ Used |
| `src/app/components/project-detail/navigation/ProjectNavigationItem.js` | 2.5 KB | 66 | 1 (ProjectNavigation) | ✅ Used |
| `src/app/components/common/buttons/action_button_comp/ActionButtonContent.js` | 2.4 KB | 66 | 1 (ActionButton) | ✅ Used |
| `src/app/components/ui/success_modal_comp/SuccessMark.js` | 2.4 KB | 62 | 1 (SuccessModalContent) | ✅ Used |
| `src/app/page.js` | 2.4 KB | 82 | entry-point | ✅ Used |
| `src/app/components/project-detail/snapshot/ProjectSnapshot.js` | 2.3 KB | 64 | 1 (ProjectDetail) | ✅ Used |
| `src/app/components/project-detail/body/context/ProjectContext.js` | 2.3 KB | 62 | 1 (ProjectDetail) | ✅ Used |
| `src/app/components/project-detail/body/design/ProjectDesign.js` | 2.3 KB | 60 | 1 (ProjectDetail) | ✅ Used |
| `src/app/components/sections/education_comp/EducationStack.js` | 2.3 KB | 62 | 1 (EducationSection) | ✅ Used |
| `src/app/components/sections/education_comp/EducationHeader.js` | 2.2 KB | 60 | 1 (EducationSection) | ✅ Used |
| `src/app/components/project-detail/hero/ProjectHeroActions.js` | 2.2 KB | 68 | 0 | ❌ **UNUSED** |
| `src/app/components/layout/footer_comp/FooterMeta.js` | 2.2 KB | 58 | 1 (Footer) | ✅ Used |
| `src/app/components/sections/about_comp/AboutContent.js` | 2.2 KB | 60 | 1 (aboutSection) | ✅ Used |
| `src/app/components/sections/experience_comp/ExperienceTabContent.js` | 2.2 KB | 58 | 1 (ExperienceSection) | ✅ Used |
| `src/app/components/sections/experience_comp/ExperienceDesktopWatermark.js` | 2.1 KB | 56 | 1 (ExperienceWatermark) | ✅ Used |
| `src/app/components/sections/education_comp/education.motion.js` | 2.1 KB | 56 | 1 (EducationSection) | ✅ Used |
| `src/app/components/sections/hero_comp/MobileIntro.js` | 2.1 KB | 56 | 1 (CinematicHero) | ✅ Used |
| `src/app/components/sections/experience_comp/ExperienceMobileWatermark.js` | 2.1 KB | 54 | 1 (ExperienceWatermark) | ✅ Used |
| `src/app/components/project-detail/body/engineering/ProjectEngineeringItem.js` | 2.1 KB | 54 | 1 (ProjectEngineeringList) | ✅ Used |
| `src/app/components/sections/ContactSection.js` | 2.0 KB | 54 | 1 (page.js) | ✅ Used |
| `src/app/components/project-detail/body/approach/ProjectApproach.js` | 2.0 KB | 54 | 1 (ProjectDetail) | ✅ Used |
| `src/app/components/project-detail/body/motion/ProjectMotionItem.js` | 2.0 KB | 52 | 1 (ProjectMotionList) | ✅ Used |
| `src/app/components/sections/projects_comp/ProjectMeta.js` | 2.0 KB | 52 | 1 (ProjectPresentation) | ✅ Used |
| `src/app/components/project-detail/body/responsive/ProjectResponsiveItem.js` | 2.0 KB | 52 | 1 (ProjectResponsiveList) | ✅ Used |

### Tier 4: Tiny Files (<2 KB)

| File | Size | Lines | References | Status |
|------|------|-------|------------|--------|
| `src/app/components/layout/footer_comp/FooterOutlinedWord.js` | 1.9 KB | 50 | 1 (FooterClosing) | ✅ Used |
| `src/app/components/project-detail/body/approach/ProjectApproachItem.js` | 1.8 KB | 48 | 1 (ProjectApproachList) | ✅ Used |
| `src/app/components/sections/projects_comp/project.constants.js` | 1.8 KB | 48 | 1 (ProjectPresentation) | ✅ Used |
| `src/app/components/sections/education_comp/EducationHandoff.js` | 1.8 KB | 48 | 1 (EducationSection) | ✅ Used |
| `src/app/components/layout/footer_comp/FooterNavigation.js` | 1.8 KB | 48 | 1 (Footer) | ✅ Used |
| `src/app/components/motion/action-swap.js` | 1.8 KB | 52 | 0 | ❌ **UNUSED** |
| `src/app/components/sections/skills_comp/SkillContext.js` | 1.7 KB | 46 | 1 (SkillCategory) | ✅ Used |
| `src/app/components/project-detail/hero/ProjectHeroScrollCue.js` | 1.7 KB | 46 | 1 (ProjectHero) | ✅ Used |
| `src/app/components/project-detail/showcase/projectShowcase.constants.js` | 1.7 KB | 44 | 1 (ProjectShowcase) | ✅ Used |
| `src/app/layout.js` | 1.6 KB | 48 | entry-point | ✅ Used |
| `src/app/components/sections/about_comp/AboutMaskedWords.js` | 1.6 KB | 42 | 1 (AboutContent) | ✅ Used |
| `src/app/components/project-detail/hero/ProjectHeroEyebrow.js` | 1.6 KB | 42 | 1 (ProjectHero) | ✅ Used |
| `src/app/components/layout/footer_comp/FooterSocials.js` | 1.6 KB | 42 | 1 (Footer) | ✅ Used |
| `src/app/components/sections/education_comp/EducationCard.js` | 1.6 KB | 42 | 1 (EducationStack) | ✅ Used |
| `src/app/components/project-detail/snapshot/ProjectSnapshotRow.js` | 1.6 KB | 40 | 1 (ProjectSnapshotList) | ✅ Used |
| `src/app/components/common/buttons/dounload_button_comp/DownloadButtonCover.js` | 1.5 KB | 40 | 1 (DownloadButton) | ✅ Used |
| `src/app/components/sections/SomeComponent.js` | 1.5 KB | 36 | 0 | ❌ **UNUSED** |
| `src/app/components/sections/education_comp/EducationCardMeta.js` | 1.5 KB | 38 | 1 (EducationCard) | ✅ Used |
| `src/app/components/layout/footer_comp/FooterClosing.js` | 1.5 KB | 40 | 1 (Footer) | ✅ Used |
| `src/app/components/common/EyebrowLabel.jsx` | 1.5 KB | 38 | 1 (CinematicHero) | ✅ Used |
| `src/app/components/sections/experience_comp/ExperienceCompanyEyebrow.js` | 1.5 KB | 38 | 1 (ExperienceSection) | ✅ Used |
| `src/app/components/layout/footer_comp/FooterAtmosphere.js` | 1.4 KB | 36 | 1 (Footer) | ✅ Used |
| `src/app/components/motion/MotionNumber/MotionDigit.js` | 1.4 KB | 36 | 1 (MotionNumber) | ✅ Used |
| `src/app/components/common/buttons/action_button_comp/ActionButtonRipple.js` | 1.4 KB | 36 | 1 (ActionButton) | ✅ Used |
| `src/app/components/sections/contact_comp/ContactAtmosphere.js` | 1.4 KB | 36 | 1 (ContactSection) | ✅ Used |
| `src/app/components/common/buttons/action_button_comp/ActionButtonSubmitting.js` | 1.4 KB | 36 | 1 (ActionButton) | ✅ Used |
| `src/app/components/common/section_heading_comp/SectionHeadingWords.js` | 1.3 KB | 34 | 1 (SectionHeading) | ✅ Used |
| `src/app/data/aboutData.js` | 1.3 KB | 34 | 1 (portfolio.js) | ✅ Used |
| `src/app/components/sections/contact_comp/ContactIntro.js` | 1.3 KB | 34 | 1 (ContactSection) | ✅ Used |
| `src/app/lib/motion/constants.js` | 1.3 KB | 32 | 2+ | ✅ Used |
| `src/app/components/ui/Skeleton.js` | 1.3 KB | 34 | 5+ | ✅ Used |
| `src/app/components/layout/DesktopNavigation.js` | 1.3 KB | 32 | 1 (Navbar) | ✅ Used |
| `src/app/components/sections/projects_comp/ProjectContribution.js` | 1.3 KB | 32 | 1 (ProjectPresentation) | ✅ Used |
| `src/app/components/sections/skills_comp/SkillSupporting.js` | 1.3 KB | 32 | 1 (SkillCategory) | ✅ Used |
| `src/app/components/common/buttons/action_button_comp/ActionButtonSuccess.js` | 1.3 KB | 32 | 1 (ActionButton) | ✅ Used |
| `src/app/components/sections/education_comp/EducationStatic.js` | 1.2 KB | 32 | 1 (EducationSection) | ✅ Used |
| `src/app/components/project-detail/body/responsive/ProjectResponsiveList.js` | 1.2 KB | 32 | 1 (ProjectResponsive) | ✅ Used |
| `src/app/components/sections/hero_comp/HeroImageOverlays.js` | 1.2 KB | 32 | 1 (CinematicHero) | ✅ Used |
| `src/app/components/common/buttons/dounload_button_comp/DownloadButtonProgress.js` | 1.2 KB | 30 | 1 (DownloadButton) | ✅ Used |
| `src/app/components/common/buttons/dounload_button_comp/DownloadButtonPercentage.js` | 1.2 KB | 30 | 1 (DownloadButton) | ✅ Used |
| `src/app/components/sections/contact_comp/contact.motion.js` | 1.1 KB | 28 | 1 (ContactSection) | ✅ Used |
| `src/app/components/project-detail/body/motion/ProjectMotionList.js` | 1.1 KB | 28 | 1 (ProjectMotion) | ✅ Used |
| `src/app/providers/MotionProvider.js` | 1.1 KB | 28 | 1 (AppProviders) | ✅ Used |
| `src/app/providers/MobileMenuProvider.js` | 1.1 KB | 28 | 1 (AppProviders) | ✅ Used |
| `src/app/components/ui/SocialIcon.js` | 1.0 KB | 26 | 1 (Navbar) | ✅ Used |
| `src/app/components/layout/footer_comp/FooterClosingLine.js` | 1.0 KB | 26 | 1 (FooterClosing) | ✅ Used |
| `src/app/components/errors/instrumentation.js` | 982 B | 30 | 0 | ❌ **UNUSED** |
| `src/app/components/project-detail/body/reflection/ProjectReflectionImprove.js` | 962 B | 26 | 1 (ProjectReflection) | ✅ Used |
| `src/app/data/socialData.js` | 949 B | 26 | 1 (portfolio.js) | ✅ Used |
| `src/app/components/project-detail/body/context/ProjectContextBody.js` | 915 B | 24 | 1 (ProjectContext) | ✅ Used |
| `src/app/components/sections/about_comp/AboutCapabilities.js` | 904 B | 24 | 1 (aboutSection) | ✅ Used |
| `src/app/components/layout/footer_comp/FooterIdentity.js` | 874 B | 22 | 1 (Footer) | ✅ Used |
| `src/app/components/sections/contact_comp/ContactMessageCounter.js` | 837 B | 22 | 1 (ContactFormFields) | ✅ Used |
| `src/app/components/sections/experience_comp/ExperienceMetadata.js` | 805 B | 20 | 1 (ExperienceSection) | ✅ Used |
| `src/app/components/common/section_heading_comp/sectionHeading.constants.js` | 785 B | 20 | 2 (SectionHeading*) | ✅ Used |
| `src/app/lib/motion/easings.js` | 778 B | 20 | 4+ | ✅ Used |
| `src/app/components/ui/EditorialNumber.js` | 740 B | 20 | 1 (MobileMenu) | ✅ Used |
| `src/app/components/project-detail/hero/ProjectHeroMeta.js` | 728 B | 18 | 1 (ProjectHero) | ✅ Used |
| `src/app/lib/lenis/SmoothScroll.js` | 681 B | 18 | 1 (AppProviders) | ✅ Used |
| `src/app/lib/resend.js` | 673 B | 17 | 1 (API route) | ✅ Used |
| `src/app/components/common/buttons/dounload_button_comp/downloadButton.constants.js` | 661 B | 18 | 5 | ✅ Used |
| `src/app/hooks/useBreakpoint.js` | 638 B | 18 | 1 (CinematicHero) | ✅ Used |
| `src/app/components/sections/education_comp/education.data.js` | 633 B | 16 | 1 (EducationSection) | ✅ Used |
| `src/app/providers/AppProviders.js` | 626 B | 16 | 1 (layout.js) | ✅ Used |
| `src/app/data/educationData.js` | 612 B | 16 | 1 (portfolio.js) | ✅ Used |
| `src/app/components/sections/experience_comp/ExperienceCompanyHeader.js` | 607 B | 16 | 1 (ExperienceSection) | ✅ Used |
| `src/app/components/project-detail/body/context/ProjectContextStatement.js` | 607 B | 16 | 1 (ProjectContext) | ✅ Used |
| `src/app/components/sections/contact_comp/ContactRevealRow.js` | 603 B | 16 | 1 (ContactSection) | ✅ Used |
| `src/app/components/sections/contact_comp/contactForm.api.js` | 603 B | 16 | 1 (ContactForm) | ✅ Used |
| `src/app/components/project-detail/body/engineering/ProjectEngineeringList.js` | 587 B | 16 | 1 (ProjectEngineering) | ✅ Used |
| `src/app/components/common/buttons/action_button_comp/actionButton.constants.js` | 567 B | 14 | 1 (ActionButton) | ✅ Used |
| `src/app/data/navigationData.js` | 558 B | 14 | 1 (portfolio.js) | ✅ Used |
| `src/app/components/project-detail/body/approach/ProjectApproachList.js` | 558 B | 14 | 1 (ProjectApproach) | ✅ Used |
| `src/app/components/sections/projects_comp/ProjectRenderer.js` | 556 B | 14 | 1 (ProjectsSection) | ✅ Used |
| `src/app/components/layout/DesktopNavigation/ActiveDot.js` | 549 B | 14 | 1 (NavLink) | ✅ Used |
| `src/app/global-error.js` | 537 B | 14 | framework | ✅ Used |
| `src/app/store/slices/uiSlice.js` | 536 B | 17 | 0 | ❌ **UNUSED** |
| `src/app/components/sections/HeroSection.js` | 529 B | 14 | 1 (page.js) | ✅ Used |
| `src/app/components/project-detail/body/design/ProjectDesignBody.js` | 502 B | 15 | 0 | ❌ **UNUSED** |
| `src/app/components/ui/success_modal_comp/successModal.motion.js` | 499 B | 14 | 1 (SuccessModal) | ✅ Used |
| `src/app/components/sections/index.js` | 486 B | 12 | 1 (page.js) | ✅ Used |
| `src/app/error/page.js` | 478 B | 12 | framework | ✅ Used |
| `src/app/components/project-detail/snapshot/ProjectSnapshotList.js` | 454 B | 12 | 1 (ProjectSnapshot) | ✅ Used |
| `src/app/components/layout/DesktopNavigation/NavLink.js` | 438 B | 12 | 1 (DesktopNavigation) | ✅ Used |
| `src/app/components/sections/experience_comp/experience.constants.js` | 392 B | 10 | 1 (ExperienceSection) | ✅ Used |
| `src/app/components/sections/aboutSection.js` | 375 B | 10 | 1 (page.js) | ✅ Used |
| `src/app/data/index.js` | 358 B | 8 | 1 (portfolio.js) | ✅ Used |
| `src/app/providers/UIThemeProvider.js` | 351 B | 8 | 1 (layout.js) | ✅ Used |
| `src/app/data/contactEmail.js` | 329 B | 8 | 2 (API, data) | ✅ Used |
| `src/app/components/common/buttons/dounload_button_comp/DownloadButtonIcon.js` | 326 B | 8 | 1 (DownloadButton) | ✅ Used |
| `src/app/components/common/buttons/action_button_comp/ActionButtonIcon.js` | 324 B | 8 | 1 (ActionButton) | ✅ Used |
| `src/app/error.js` | 319 B | 8 | framework | ✅ Used |
| `src/app/helper/flattenNav.Links.js` | 311 B | 8 | 1 (Navbar) | ✅ Used |
| `src/app/not-found.js` | 289 B | 8 | framework | ✅ Used |
| `src/app/hooks/useReducedMotion.js` | 269 B | 8 | 3+ | ✅ Used |
| `src/app/store/index.js` | 193 B | 9 | 0 | ❌ **UNUSED** |
| `src/app/components/common/Container.js` | 179 B | 6 | 4+ | ✅ Used |
| `src/app/lib/utils.js` | 139 B | 4 | 6+ | ✅ Used |
| `src/app/components/motion/MotionNumber/motionNumber.constants.js` | 139 B | 4 | 2 | ✅ Used |
| `src/app/lib/motion/ease.js` | 64 B | 2 | 1 | ✅ Used |
| `src/app/components/layout/footer_comp/index.js` | 60 B | 2 | 1 (Footer) | ✅ Used |
| `src/app/components/common/logo/index.js` | 48 B | 2 | 1 (Navbar) | ✅ Used |

---

## Package Dependencies

| Package | Size (installed) | Used in | Status |
|---------|-----------------|---------|--------|
| `motion` | ~150 KB | 20+ components | ✅ Core dependency |
| `next` | ~50 KB | framework | ✅ Core |
| `react` / `react-dom` | ~45 KB | framework | ✅ Core |
| `lucide-react` | ~30 KB | 8 components | ✅ Used (tree-shakeable) |
| `next-themes` | ~5 KB | UIThemeProvider | ✅ Used |
| `lenis` | ~15 KB | SmoothScroll | ✅ Used |
| `clsx` | ~2 KB | utilities | ✅ Used |
| `tailwind-merge` | ~5 KB | cn() utility | ✅ Used |
| `resend` | ~50 KB | API route only | ✅ Server-only |
| ~~`three`~~ | ~~0 KB~~ | ~~not used~~ | ❌ **Removed** |
| ~~`@reduxjs/toolkit`~~ | ~~0 KB~~ | ~~not used~~ | ❌ **Removed** |
| ~~`react-redux`~~ | ~~0 KB~~ | ~~not used~~ | ❌ **Removed** |
| ~~`react-icons`~~ | ~~0 KB~~ | ~~not used~~ | ❌ **Removed** |

---

## Cleanup Recommendations

### Safe to delete (0 references):

1. **`src/app/data/portfolio_copyold.js`** (30.5 KB) — Old backup, superseded by `portfolio.js`
2. **`src/app/components/common/buttons/SendButton.js`** (19.8 KB) — Dead code, never imported
3. **`src/app/components/common/logo/CircularV.js`** (10.5 KB) — Not imported anywhere
4. **`src/app/components/common/logo/LightModeLogo.js`** (4.4 KB) — Not imported anywhere
5. **`src/app/components/ui/LazyImage.js`** (3.4 KB) — Created but never used
6. **`src/app/components/project-detail/hero/ProjectHeroActions.js`** (2.2 KB) — Not imported
7. **`src/app/components/motion/action-swap.js`** (1.8 KB) — Only in docs, not in code
8. **`src/app/components/sections/SomeComponent.js`** (1.5 KB) — Dev scratch file
9. **`src/app/components/errors/instrumentation.js`** (982 B) — Not imported
10. **`src/app/components/project-detail/body/design/ProjectDesignBody.js`** (502 B) — Not imported
11. **`src/app/store/index.js`** (193 B) — Redux store, replaced by MobileMenuProvider
12. **`src/app/store/slices/uiSlice.js`** (536 B) — Redux slice, replaced by MobileMenuProvider

**Total reclaimable: ~76 KB / ~2,091 lines**
