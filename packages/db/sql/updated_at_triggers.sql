-- updated_at trigger function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables that have an updated_at column
DO $$
BEGIN
  -- blogs
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blogs' AND column_name = 'updated_at'
  ) THEN
    DROP TRIGGER IF EXISTS set_updated_at_blogs ON blogs;
    CREATE TRIGGER set_updated_at_blogs
      BEFORE UPDATE ON blogs
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  -- services
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'updated_at'
  ) THEN
    DROP TRIGGER IF EXISTS set_updated_at_services ON services;
    CREATE TRIGGER set_updated_at_services
      BEFORE UPDATE ON services
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  -- products
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'updated_at'
  ) THEN
    DROP TRIGGER IF EXISTS set_updated_at_products ON products;
    CREATE TRIGGER set_updated_at_products
      BEFORE UPDATE ON products
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  -- case_studies
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'case_studies' AND column_name = 'updated_at'
  ) THEN
    DROP TRIGGER IF EXISTS set_updated_at_case_studies ON case_studies;
    CREATE TRIGGER set_updated_at_case_studies
      BEFORE UPDATE ON case_studies
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  -- partners
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'partners' AND column_name = 'updated_at'
  ) THEN
    DROP TRIGGER IF EXISTS set_updated_at_partners ON partners;
    CREATE TRIGGER set_updated_at_partners
      BEFORE UPDATE ON partners
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  -- testimonials
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'testimonials' AND column_name = 'updated_at'
  ) THEN
    DROP TRIGGER IF EXISTS set_updated_at_testimonials ON testimonials;
    CREATE TRIGGER set_updated_at_testimonials
      BEFORE UPDATE ON testimonials
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  -- faqs
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'faqs' AND column_name = 'updated_at'
  ) THEN
    DROP TRIGGER IF EXISTS set_updated_at_faqs ON faqs;
    CREATE TRIGGER set_updated_at_faqs
      BEFORE UPDATE ON faqs
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  -- gallery_items
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gallery_items' AND column_name = 'updated_at'
  ) THEN
    DROP TRIGGER IF EXISTS set_updated_at_gallery_items ON gallery_items;
    CREATE TRIGGER set_updated_at_gallery_items
      BEFORE UPDATE ON gallery_items
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  -- gallery_categories
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gallery_categories' AND column_name = 'updated_at'
  ) THEN
    DROP TRIGGER IF EXISTS set_updated_at_gallery_categories ON gallery_categories;
    CREATE TRIGGER set_updated_at_gallery_categories
      BEFORE UPDATE ON gallery_categories
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  -- user_profiles
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'updated_at'
  ) THEN
    DROP TRIGGER IF EXISTS set_updated_at_user_profiles ON user_profiles;
    CREATE TRIGGER set_updated_at_user_profiles
      BEFORE UPDATE ON user_profiles
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  -- company_members
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'company_members' AND column_name = 'updated_at'
  ) THEN
    DROP TRIGGER IF EXISTS set_updated_at_company_members ON company_members;
    CREATE TRIGGER set_updated_at_company_members
      BEFORE UPDATE ON company_members
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END
$$;
