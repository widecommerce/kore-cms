﻿using System.Data.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Kore.Caching;
using Kore.Collections;
using Kore.Data;
using Kore.Data.Services;
using Kore.Web.ContentManagement.Areas.Admin.Pages.Domain;

namespace Kore.Web.ContentManagement.Areas.Admin.Pages.Services
{
    public interface IPageService : IGenericDataService<Page>
    {
        IEnumerable<Page> GetTopLevelPages();
    }

    public class PageService : GenericDataService<Page>, IPageService
    {
        private readonly IRepository<PageVersion> pageVersionRepository;

        public PageService(
            ICacheManager cacheManager,
            IRepository<Page> repository,
            IRepository<PageVersion> pageVersionRepository)
            : base(cacheManager, repository)
        {
            this.pageVersionRepository = pageVersionRepository;
        }

        #region Delete

        public override int Delete(IEnumerable<Page> entities)
        {
            var pageIds = entities.Select(x => x.Id);

            // Delete Page Versions
            int rowsAffected = pageVersionRepository.Delete(x => pageIds.Contains(x.PageId));
            rowsAffected += base.Delete(entities);

            // Ensure No Orphans
            var pages = Find(x => pageIds.Contains(x.Id));
            EnsureNoOrphans(pages);

            return rowsAffected;
        }

        public override int Delete(IQueryable<Page> query)
        {
            var pageIds = query.Select(x => x.Id).ToArray();

            // Delete Page Versions
            int rowsAffected = pageVersionRepository.Delete(x => pageIds.Contains(x.PageId));
            rowsAffected += base.Delete(query);

            // Ensure No Orphans
            var pages = Find(x => pageIds.Contains(x.Id));
            EnsureNoOrphans(pages);

            return rowsAffected;
        }

        public override int Delete(Page entity)
        {
            // Delete Page Versions
            int rowsAffected = pageVersionRepository.Delete(x => x.PageId == entity.Id);
            rowsAffected += base.Delete(entity);

            // Ensure No Orphans
            EnsureNoOrphans(entity);

            return rowsAffected;
        }

        public override int Delete(Expression<Func<Page, bool>> filterExpression)
        {
            var pages = Find(filterExpression);
            var pageIds = pages.Select(x => x.Id).ToArray();

            // Delete Page Versions
            int rowsAffected = pageVersionRepository.Delete(x => pageIds.Contains(x.PageId));
            rowsAffected += base.Delete(filterExpression);

            // Ensure No Orphans
            EnsureNoOrphans(pages);

            return rowsAffected;
        }

        public override int DeleteAll()
        {
            var pages = Find();
            var pageIds = pages.Select(x => x.Id).ToArray();

            // Delete Page Versions
            int rowsAffected = pageVersionRepository.Delete(x => pageIds.Contains(x.PageId));
            rowsAffected += base.DeleteAll();

            // Ensure No Orphans
            EnsureNoOrphans(pages);

            return rowsAffected;
        }

        public override async Task<int> DeleteAllAsync()
        {
            var pages = await FindAsync();
            var pageIds = pages.Select(x => x.Id).ToArray();

            // Delete Page Versions
            int rowsAffected = await pageVersionRepository.DeleteAsync(x => pageIds.Contains(x.PageId));
            rowsAffected += await base.DeleteAllAsync();

            // Ensure No Orphans
            await EnsureNoOrphansAsync(pages);

            return rowsAffected;
        }

        public override async Task<int> DeleteAsync(IEnumerable<Page> entities)
        {
            var pageIds = entities.Select(x => x.Id);

            // Delete Page Versions
            int rowsAffected = await pageVersionRepository.DeleteAsync(x => pageIds.Contains(x.PageId));
            rowsAffected += await base.DeleteAsync(entities);

            // Ensure No Orphans
            var pages = await FindAsync(x => pageIds.Contains(x.Id));
            await EnsureNoOrphansAsync(pages);

            return rowsAffected;
        }

        public override async Task<int> DeleteAsync(IQueryable<Page> query)
        {
            var pageIds = query.Select(x => x.Id).ToArray();

            // Delete Page Versions
            int rowsAffected = await pageVersionRepository.DeleteAsync(x => pageIds.Contains(x.PageId));
            rowsAffected += await base.DeleteAsync(query);

            // Ensure No Orphans
            var pages = await FindAsync(x => pageIds.Contains(x.Id));
            await EnsureNoOrphansAsync(pages);

            return rowsAffected;
        }

        public override async Task<int> DeleteAsync(Page entity)
        {
            // Delete Page Versions
            int rowsAffected = await pageVersionRepository.DeleteAsync(x => x.PageId == entity.Id);
            rowsAffected += await base.DeleteAsync(entity);

            // Ensure No Orphans
            await EnsureNoOrphansAsync(entity);

            return rowsAffected;
        }

        public override async Task<int> DeleteAsync(Expression<Func<Page, bool>> filterExpression)
        {
            var pages = await FindAsync(filterExpression);
            var pageIds = pages.Select(x => x.Id).ToArray();

            // Delete Page Versions
            int rowsAffected = await pageVersionRepository.DeleteAsync(x => pageIds.Contains(x.PageId));
            rowsAffected += await base.DeleteAsync(filterExpression);

            // Ensure No Orphans
            await EnsureNoOrphansAsync(pages);

            return rowsAffected;
        }

        #endregion

        #region Insert

        public override int Insert(IEnumerable<Page> entities)
        {
            int rowsAffected = base.Insert(entities);

            var pageVersions = entities.Select(x => new PageVersion
            {
                Id = Guid.NewGuid(),
                PageId = x.Id,
                CultureCode = null,
                DateCreatedUtc = DateTime.UtcNow,
                DateModifiedUtc = DateTime.UtcNow,
                Status = VersionStatus.Draft,
                Title = x.Name,
                Slug = x.Name.ToSlugUrl()
            });
            rowsAffected += pageVersionRepository.Insert(pageVersions);

            return rowsAffected;
        }

        public override int Insert(Page entity)
        {
            int rowsAffected = base.Insert(entity);

            rowsAffected += pageVersionRepository.Insert(new PageVersion
            {
                Id = Guid.NewGuid(),
                PageId = entity.Id,
                CultureCode = null,
                DateCreatedUtc = DateTime.UtcNow,
                DateModifiedUtc = DateTime.UtcNow,
                Status = VersionStatus.Draft,
                Title = entity.Name,
                Slug = entity.Name.ToSlugUrl()
            });

            return rowsAffected;
        }

        public override async Task<int> InsertAsync(IEnumerable<Page> entities)
        {
            int rowsAffected = await base.InsertAsync(entities);

            var pageVersions = entities.Select(x => new PageVersion
            {
                Id = Guid.NewGuid(),
                PageId = x.Id,
                CultureCode = null,
                DateCreatedUtc = DateTime.UtcNow,
                DateModifiedUtc = DateTime.UtcNow,
                Status = VersionStatus.Draft,
                Title = x.Name,
                Slug = x.Name.ToSlugUrl()
            });
            rowsAffected += await pageVersionRepository.InsertAsync(pageVersions);

            return rowsAffected;
        }

        public override async Task<int> InsertAsync(Page entity)
        {
            int rowsAffected = await base.InsertAsync(entity);

            rowsAffected += await pageVersionRepository.InsertAsync(new PageVersion
            {
                Id = Guid.NewGuid(),
                PageId = entity.Id,
                CultureCode = null,
                DateCreatedUtc = DateTime.UtcNow,
                DateModifiedUtc = DateTime.UtcNow,
                Status = VersionStatus.Draft,
                Title = entity.Name,
                Slug = entity.Name.ToSlugUrl()
            });

            return rowsAffected;
        }

        #endregion

        private void EnsureNoOrphans(Page page)
        {
            var toUpdate = new List<Page>();

            var subPages = Find(x => x.ParentId == page.Id);
            subPages.ForEach(x =>
            {
                x.ParentId = page.ParentId;
                toUpdate.Add(x);
            });

            Update(toUpdate);
        }

        private void EnsureNoOrphans(IEnumerable<Page> pages)
        {
            var toUpdate = new List<Page>();
            foreach (var page in pages)
            {
                var subPages = Find(x => x.ParentId == page.Id);

                subPages.ForEach(x =>
                {
                    x.ParentId = page.ParentId;
                    toUpdate.Add(x);
                });
            }
            Update(toUpdate);
        }

        private async Task EnsureNoOrphansAsync(Page page)
        {
            var toUpdate = new List<Page>();

            var subPages = await FindAsync(x => x.ParentId == page.Id);
            subPages.ForEach(x =>
            {
                x.ParentId = page.ParentId;
                toUpdate.Add(x);
            });

            await UpdateAsync(toUpdate);
        }

        private async Task EnsureNoOrphansAsync(IEnumerable<Page> pages)
        {
            var toUpdate = new List<Page>();
            foreach (var page in pages)
            {
                var subPages = await FindAsync(x => x.ParentId == page.Id);

                subPages.ForEach(x =>
                {
                    x.ParentId = page.ParentId;
                    toUpdate.Add(x);
                });
            }
            await UpdateAsync(toUpdate);
        }

        #region IPageService Members

        public IEnumerable<Page> GetTopLevelPages()
        {
            return Query(x => x.ParentId == null)
                .OrderBy(x => x.Name)
                .ToHashSet();
        }

        #endregion IPageService Members
    }
}