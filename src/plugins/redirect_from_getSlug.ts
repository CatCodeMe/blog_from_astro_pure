export default function getSlugFromFilePath(filePath: string) {
        const parsedPath = path.parse(filePath)
        let slug
      
        // construct slug as full path from either:
        // - folder name if file name is index.md, or
        // - file name
        if (parsedPath.base === 'index.md' || parsedPath.base === 'index.mdx') {
          slug = `${parsedPath.dir}`
        } else {
          slug = `${parsedPath.dir}/${parsedPath.name}`
        }
      
        return slug
      }