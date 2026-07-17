import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '@/lib/hooks/useDocumentTitle'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, ShieldCheck, ShieldOff } from 'lucide-react'
import { usersApi } from '@/lib/api/resources/users'
import { criteria, type SearchCriteria } from '@/lib/api/pageable'
import type { UserRoleResponse } from '@/types/api'
import { useServerGrid } from '@/components/data-grid/useServerGrid'
import { ServerDataGrid, type ColumnSpec } from '@/components/data-grid/ServerDataGrid'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useConfirm } from '@/components/common/confirm'
import { useToast } from '@/components/common/toast'
import { parseApiError } from '@/lib/api/errors'
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue'
import { initials } from '@/lib/utils'

export function UsersPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('users.title'))
  const confirm = useConfirm()
  const toast = useToast()
  const qc = useQueryClient()

  const grid = useServerGrid<UserRoleResponse>({
    queryKey: 'users',
    fetcher: usersApi.pageable,
    defaultSort: { key: 'full_name', direction: 'ASC' },
  })

  const [searchText, setSearchText] = useState('')
  const [verified, setVerified] = useState('')
  const [active, setActive] = useState('')
  const debouncedSearch = useDebouncedValue(searchText)

  useEffect(() => {
    const search: SearchCriteria[] = []
    const text = debouncedSearch.trim()
    if (text) search.push(/\d/.test(text) ? criteria('phoneNumber', '=', text) : criteria('fullName', '=', text))
    if (verified) search.push(criteria('verified', '=', verified === 'true'))
    if (active) search.push(criteria('active', '=', active === 'true'))
    grid.setSearch(search)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, verified, active])

  const roleMutation = useMutation({
    mutationFn: ({ userId, grant }: { userId: string; grant: boolean }) =>
      grant ? usersApi.grantRole(userId, 'ADMIN') : usersApi.revokeRole(userId, 'ADMIN'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })

  async function toggleAdmin(user: UserRoleResponse) {
    const isAdmin = user.roles.includes('ADMIN')
    const ok = await confirm({
      title: isAdmin ? t('users.revokeTitle') : t('users.grantTitle'),
      message: isAdmin
        ? t('users.revokeMsg', { name: user.fullName })
        : t('users.grantMsg', { name: user.fullName }),
      danger: isAdmin,
      confirmLabel: isAdmin ? t('users.revokeAdmin') : t('users.makeAdmin'),
    })
    if (!ok) return
    try {
      await roleMutation.mutateAsync({ userId: user.userId, grant: !isAdmin })
      toast.success(t('toast.updated'))
    } catch (e) {
      toast.danger(parseApiError(e, t('toast.genericError')).message)
    }
  }

  const hasFilters = useMemo(
    () => !!searchText.trim() || !!verified || !!active,
    [searchText, verified, active],
  )

  const columns: ColumnSpec<UserRoleResponse>[] = [
    {
      id: 'phone',
      header: t('users.colPhone'),
      sortKey: 'phone_number',
      cell: (u) => <span className="font-mono font-medium">{u.phoneNumber}</span>,
    },
    {
      id: 'name',
      header: t('users.colName'),
      sortKey: 'full_name',
      cell: (u) => (
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-[11px] font-bold text-accent">
            {initials(u.fullName)}
          </span>
          <span className="font-medium">{u.fullName}</span>
        </div>
      ),
    },
    {
      id: 'roles',
      header: t('users.colRoles'),
      cell: (u) => (
        <div className="flex gap-1.5">
          {u.roles.map((r) => (
            <Badge key={r} variant={r === 'ADMIN' ? 'accent' : 'neutral'}>
              {r}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      id: 'verified',
      header: t('users.colVerified'),
      cell: (u) =>
        u.verified ? (
          <Badge variant="green" shape="pill">
            {t('users.verified')}
          </Badge>
        ) : (
          <Badge variant="neutral" shape="pill">
            {t('users.notVerified')}
          </Badge>
        ),
    },
    {
      id: 'rating',
      header: t('users.colRating'),
      cell: (u) =>
        u.ratingCount ? (
          <span className="font-medium">★ {u.ratingAvg} ({u.ratingCount})</span>
        ) : (
          <span className="text-muted">{t('users.noRating')}</span>
        ),
    },
    {
      id: 'active',
      header: t('users.colActive'),
      cell: (u) =>
        u.active ? (
          <Badge variant="green" shape="pill">
            {t('users.active')}
          </Badge>
        ) : (
          <Badge variant="neutral" shape="pill">
            {t('users.inactive')}
          </Badge>
        ),
    },
    {
      id: 'actions',
      header: t('users.colActions'),
      align: 'right',
      cell: (u) => {
        const isAdmin = u.roles.includes('ADMIN')
        return (
          <Button
            variant={isAdmin ? 'outline' : 'primary'}
            size="sm"
            onClick={() => toggleAdmin(u)}
            disabled={roleMutation.isPending}
          >
            {isAdmin ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
            {isAdmin ? t('users.revokeAdmin') : t('users.makeAdmin')}
          </Button>
        )
      },
    },
  ]

  return (
    <div>
      <div className="mb-[18px]">
        <div className="text-[22px] font-bold tracking-tight">{t('users.title')}</div>
        <div className="mt-0.5 text-fg-2">{t('users.subtitle')}</div>
      </div>

      <div className="mb-[14px] flex flex-wrap items-center gap-2.5">
        <div className="relative max-w-[320px] flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <Input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={t('users.searchPlaceholder')}
            className="pl-9"
          />
        </div>
        <Select
          options={[
            { value: 'true', label: t('users.verified') },
            { value: 'false', label: t('users.notVerified') },
          ]}
          placeholder={t('users.allVerified')}
          value={verified}
          onChange={(e) => setVerified(e.target.value)}
        />
        <Select
          options={[
            { value: 'true', label: t('users.active') },
            { value: 'false', label: t('users.inactive') },
          ]}
          placeholder={t('users.allActive')}
          value={active}
          onChange={(e) => setActive(e.target.value)}
        />
      </div>

      <ServerDataGrid
        columns={columns}
        rows={grid.rows}
        meta={grid.meta}
        isLoading={grid.isLoading}
        isError={grid.isError}
        onRetry={grid.refetch}
        sort={grid.sort}
        onToggleSort={grid.toggleSort}
        page={grid.page}
        perPage={grid.perPage}
        onPage={grid.setPage}
        onPerPage={grid.setPerPage}
        rowKey={(u) => u.userId}
        minWidth={760}
        emptyTitle={hasFilters ? t('grid.noResultsTitle') : t('users.emptyTitle')}
        emptyMessage={hasFilters ? t('grid.noResultsMsg') : t('users.emptyMsg')}
      />
    </div>
  )
}
