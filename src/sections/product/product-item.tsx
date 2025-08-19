import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import axios from 'axios';
import { API_BASE_URL } from 'src/config-global';

import { useState, useEffect } from 'react';

import { fCurrency } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { ColorPreview } from 'src/components/color-utils';
import { Iconify } from 'src/components/iconify';
import InputAdornment from '@mui/material/InputAdornment';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Select from '@mui/material/Select';

// ----------------------------------------------------------------------

type PortionType = {
  id: number;
  name: string;
  volume: number;
  unit: string;
};

type VariantType = {
  id: number;
  portion: PortionType;
  price: string;
  is_default: boolean;
};

export type ProductItemProps = {
  id: string;
  name: string;
  price: number;
  status: string;
  coverUrl: string;
  colors: string[];
  priceSale: number | null;
  variants?: VariantType[];
};

export function ProductItem({ product, showSkeleton, onChange }: { product: ProductItemProps & { description?: string; ingredients?: string; volume?: string }; showSkeleton?: boolean; onChange?: () => void }) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<VariantType | null>(
    product.variants && product.variants.length > 0
      ? product.variants.find(v => v.is_default) || product.variants[0]
      : null
  );

  // Модалка редактирования
  const [openEdit, setOpenEdit] = useState(false);
  // Состояния для редактирования
  const [editName, setEditName] = useState(product.name);
  const [editVolume, setEditVolume] = useState(product.volume || '');
  const [editPrice, setEditPrice] = useState(product.price);
  const [editDescription, setEditDescription] = useState(product.description || '');
  const [editIngredients, setEditIngredients] = useState(product.ingredients || '');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState(false);
  
  // Редактирование вариантов
  const [editVariants, setEditVariants] = useState<Array<{
    id?: number;
    portion_id: number;
    price: string;
    is_default: boolean;
  }>>([]);
  const [portions, setPortions] = useState<PortionType[]>([]);
  const [portionsLoading, setPortionsLoading] = useState(false);

  // Загрузка доступных порций при открытии модалки редактирования
  useEffect(() => {
    if (openEdit) {
      setPortionsLoading(true);
      const token = localStorage.getItem('authToken');
      axios.get(`${API_BASE_URL}/api/portions/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      })
        .then(res => {
          setPortions(Array.isArray(res.data) ? res.data : []);
          setPortionsLoading(false);
          
          // Инициализируем варианты из продукта
          if (product.variants && product.variants.length > 0) {
            const initialVariants = product.variants.map(variant => ({
              id: variant.id,
              portion_id: variant.portion.id,
              price: variant.price,
              is_default: variant.is_default
            }));
            setEditVariants(initialVariants);
          } else {
            setEditVariants([]);
          }
        })
        .catch(() => {
          setPortionsLoading(false);
        });
    }
  }, [openEdit, product.variants]);

  // Модалка смены изображения
  const [openImage, setOpenImage] = useState(false);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageSuccess, setImageSuccess] = useState(false);

  // Модалка удаления
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const handleOpenPopover = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  };
  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  // Открытие модалок
  const handleOpenEdit = () => {
    setOpenEdit(true);
    setEditName(product.name);
    setEditVolume(product.volume || '');
    setEditPrice(product.price);
    setEditDescription(product.description || '');
    setEditIngredients(product.ingredients || '');
    setEditError(null);
    setEditSuccess(false);
    handleClosePopover();
  };
  const handleOpenImage = () => {
    setOpenImage(true);
    setNewImage(null);
    setImageError(null);
    setImageSuccess(false);
    handleClosePopover();
  };
  const handleOpenDelete = () => {
    setOpenDelete(true);
    setDeleteError(null);
    setDeleteSuccess(false);
    handleClosePopover();
  };

  // Закрытие модалок
  const handleCloseEdit = () => setOpenEdit(false);
  const handleCloseImage = () => setOpenImage(false);
  const handleCloseDelete = () => setOpenDelete(false);

  // Обработка изменения варианта
  const handleVariantChange = (
    event: React.MouseEvent<HTMLElement>,
    newVariantId: number | null,
  ) => {
    if (newVariantId !== null && product.variants) {
      const variant = product.variants.find(v => v.id === newVariantId);
      if (variant) {
        setSelectedVariant(variant);
      }
    }
  };
  
  // Функции для управления вариантами при редактировании
  const handleAddVariant = () => {
    if (portions.length > 0) {
      const newVariant = {
        portion_id: portions[0].id,
        price: '',
        is_default: editVariants.length === 0 // первый вариант по умолчанию дефолтный
      };
      setEditVariants([...editVariants, newVariant]);
    }
  };

  const handleRemoveVariant = (index: number) => {
    const updatedVariants = [...editVariants];
    updatedVariants.splice(index, 1);
    
    // Если удалили дефолтный вариант, делаем первый вариант дефолтным
    if (updatedVariants.length > 0 && !updatedVariants.some(v => v.is_default)) {
      updatedVariants[0].is_default = true;
    }
    
    setEditVariants(updatedVariants);
  };

  const handleUpdateVariant = (index: number, field: string, value: any) => {
    const updatedVariants = [...editVariants];
    
    // Если меняем is_default на true, сбрасываем у всех остальных
    if (field === 'is_default' && value === true) {
      updatedVariants.forEach((v, i) => {
        if (i !== index) {
          v.is_default = false;
        }
      });
    }
    
    updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    setEditVariants(updatedVariants);
  };

  // PATCH редактирование
  const handleEdit = () => {
    setEditLoading(true);
    setEditError(null);
    setEditSuccess(false);
    const token = localStorage.getItem('authToken');
    
    const data: any = {
      name: editName,
      description: editDescription,
      ingredients: editIngredients
    };
    
    // Если есть варианты, отправляем их, иначе отправляем обычные цену и объем
    if (editVariants.length > 0) {
      data.variants = editVariants;
    } else {
      data.volume = editVolume;
      data.price = editPrice;
    }
    
    axios.patch(`${API_BASE_URL}/api/menu-items/${product.id}/`, data, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
    })
      .then(() => {
        setEditSuccess(true);
        setEditLoading(false);
        setTimeout(() => {
          setOpenEdit(false);
          onChange && onChange();
        }, 1000);
      })
      .catch(err => {
        setEditError(err?.response?.data?.detail || 'Ошибка сохранения');
        setEditLoading(false);
      });
  };

  // PATCH смена изображения
  const handleImage = () => {
    setImageLoading(true);
    setImageError(null);
    setImageSuccess(false);
    const token = localStorage.getItem('authToken');
    const formData = new FormData();
    if (newImage) formData.append('image', newImage);
    axios.patch(`${API_BASE_URL}/api/menu-items/${product.id}/image/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Token ${token}`,
      },
    })
      .then(() => {
        setImageSuccess(true);
        setImageLoading(false);
        setTimeout(() => {
          setOpenImage(false);
          onChange && onChange();
        }, 1000);
      })
      .catch(err => {
        setImageError(err?.response?.data?.detail || 'Ошибка загрузки изображения');
        setImageLoading(false);
      });
  };

  // DELETE
  const handleDelete = () => {
    setDeleteLoading(true);
    setDeleteError(null);
    setDeleteSuccess(false);
    const token = localStorage.getItem('authToken');
    axios.delete(`${API_BASE_URL}/api/menu-items/${product.id}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
      .then(() => {
        setDeleteSuccess(true);
        setDeleteLoading(false);
        setTimeout(() => {
          setOpenDelete(false);
          onChange && onChange();
        }, 1000);
      })
      .catch(err => {
        setDeleteError(err?.response?.data?.detail || 'Ошибка удаления');
        setDeleteLoading(false);
      });
  };

  const renderStatus = (
    <Label
      variant="inverted"
      color={(product.status === 'sale' && 'error') || 'info'}
      sx={{
        zIndex: 9,
        top: 16,
        right: 16,
        position: 'absolute',
        textTransform: 'uppercase',
      }}
    >
      {product.status}
    </Label>
  );

  const renderImg = showSkeleton ? (
    <Box sx={{
      width: 1,
      height: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      top: 0,
      left: 0,
      bgcolor: 'background.neutral',
      borderRadius: 2,
    }}>
      <Iconify icon="solar:cart-3-bold" width={48} height={48} sx={{ color: 'text.disabled' }} />
    </Box>
  ) : (
    <Box
      component="img"
      alt={product.name}
      src={product.coverUrl}
      sx={{
        top: 0,
        width: 1,
        height: 1,
        objectFit: 'cover',
        position: 'absolute',
      }}
    />
  );

  // Определяем цену для отображения
  const displayPrice = selectedVariant 
    ? parseFloat(selectedVariant.price) 
    : product.price;

  const renderPrice = (
    <Typography variant="subtitle1">
      <Typography
        component="span"
        variant="body1"
        sx={{
          color: 'text.disabled',
          textDecoration: 'line-through',
        }}
      >
        {product.priceSale && fCurrency(product.priceSale)}
      </Typography>
      &nbsp;
      {fCurrency(displayPrice)}
    </Typography>
  );

  // Рендер вариантов размеров/порций
  const renderVariants = product.variants && product.variants.length > 1 && (
    <ToggleButtonGroup
      value={selectedVariant?.id || null}
      exclusive
      onChange={handleVariantChange}
      aria-label="размер порции"
      size="small"
      sx={{ mb: 1, width: '100%', display: 'flex', justifyContent: 'center' }}
    >
      {product.variants.map((variant) => (
        <ToggleButton 
          key={variant.id} 
          value={variant.id}
          sx={{ minWidth: 40, flex: 1 }}
        >
          {variant.portion.name}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );

  return (
    <Card>
      <Box sx={{ pt: '100%', position: 'relative' }}>
        {product.status && renderStatus}
        {renderImg}
        <IconButton
          onClick={handleOpenPopover}
          sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10, bgcolor: 'background.paper', boxShadow: 1 }}
        >
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
        <Popover
          open={!!openPopover}
          anchorEl={openPopover}
          onClose={handleClosePopover}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuList>
            <MenuItem onClick={handleOpenEdit}>
              <Iconify icon="solar:pen-bold" sx={{ mr: 1 }} /> Редактировать
            </MenuItem>
            <MenuItem onClick={handleOpenImage}>
              <Iconify icon="solar:cart-3-bold" sx={{ mr: 1 }} /> Поменять изображение
            </MenuItem>
            <MenuItem onClick={handleOpenDelete} sx={{ color: 'error.main' }}>
              <Iconify icon="solar:trash-bin-trash-bold" sx={{ mr: 1 }} /> Удалить
            </MenuItem>
          </MenuList>
        </Popover>
      </Box>
      {/* Модалка редактирования */}
      <Dialog open={openEdit} onClose={handleCloseEdit} maxWidth="md" fullWidth>
        <DialogTitle>Редактировать позицию</DialogTitle>
        <DialogContent>
          {editError && <Alert severity="error" sx={{ mb: 2 }}>{editError}</Alert>}
          {editSuccess && <Alert severity="success" sx={{ mb: 2 }}>Изменения сохранены!</Alert>}
          <TextField
            label="Название"
            value={editName}
            onChange={e => setEditName(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            disabled={editLoading}
          />
          
          <TextField
            label="Описание"
            value={editDescription}
            onChange={e => setEditDescription(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            disabled={editLoading}
          />
          
          <TextField
            label="Ингредиенты"
            value={editIngredients}
            onChange={e => setEditIngredients(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            disabled={editLoading}
          />
          
          <Typography variant="subtitle1" sx={{ mb: 2 }}>Варианты порций</Typography>
          
          {editVariants.length === 0 ? (
            <>
              <TextField
                label="Объем"
                value={editVolume}
                onChange={e => setEditVolume(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
                disabled={editLoading}
              />
              <TextField
                label="Цена"
                type="number"
                value={editPrice}
                onChange={e => setEditPrice(Number(e.target.value))}
                fullWidth
                sx={{ mb: 2 }}
                disabled={editLoading}
                InputProps={{ endAdornment: <InputAdornment position="end">с</InputAdornment> }}
              />
            </>
          ) : (
            <Box sx={{ mb: 2 }}>
              {editVariants.map((variant, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                  <Select
                    value={variant.portion_id}
                    onChange={e => handleUpdateVariant(index, 'portion_id', Number(e.target.value))}
                    size="small"
                    disabled={editLoading || portionsLoading}
                    sx={{ flex: 2 }}
                  >
                    {portions.map(portion => (
                      <MenuItem key={portion.id} value={portion.id}>
                        {portion.name} ({portion.volume} {portion.unit})
                      </MenuItem>
                    ))}
                  </Select>
                  <TextField
                    label="Цена"
                    type="number"
                    value={variant.price}
                    onChange={e => handleUpdateVariant(index, 'price', e.target.value)}
                    size="small"
                    disabled={editLoading}
                    sx={{ flex: 1 }}
                    InputProps={{ endAdornment: <InputAdornment position="end">с</InputAdornment> }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={variant.is_default}
                        onChange={e => handleUpdateVariant(index, 'is_default', e.target.checked)}
                        disabled={editLoading}
                        size="small"
                      />
                    }
                    label="По умолчанию"
                    sx={{ flex: 1 }}
                  />
                  <IconButton 
                    onClick={() => handleRemoveVariant(index)}
                    disabled={editLoading}
                    color="error"
                    size="small"
                  >
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
          
          <Button
            variant="outlined"
            onClick={handleAddVariant}
            startIcon={<Iconify icon="mingcute:add-line" />}
            sx={{ mb: 2 }}
            disabled={editLoading || portionsLoading}
          >
            Добавить вариант
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit} disabled={editLoading}>Отмена</Button>
          <Button onClick={handleEdit} variant="contained" color="primary" disabled={editLoading}>
            {editLoading ? 'Сохраняем...' : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Модалка смены изображения */}
      <Dialog open={openImage} onClose={handleCloseImage} maxWidth="xs" fullWidth>
        <DialogTitle>Поменять изображение</DialogTitle>
        <DialogContent>
          {imageError && <Alert severity="error" sx={{ mb: 2 }}>{imageError}</Alert>}
          {imageSuccess && <Alert severity="success" sx={{ mb: 2 }}>Изображение успешно обновлено!</Alert>}
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ mb: 2 }}
            disabled={imageLoading}
          >
            {newImage ? newImage.name : 'Загрузить фото'}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  setNewImage(e.target.files[0]);
                }
              }}
            />
          </Button>
          {(newImage || product.coverUrl) && (
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Box
                component="img"
                src={newImage ? URL.createObjectURL(newImage) : product.coverUrl}
                alt="preview"
                sx={{ maxWidth: 180, maxHeight: 180, borderRadius: 2, boxShadow: 1, mx: 'auto' }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImage} disabled={imageLoading}>Отмена</Button>
          <Button onClick={handleImage} variant="contained" color="primary" disabled={imageLoading || !newImage}>
            {imageLoading ? 'Сохраняем...' : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Модалка удаления */}
      <Dialog open={openDelete} onClose={handleCloseDelete} maxWidth="xs" fullWidth>
        <DialogTitle>Удалить позицию?</DialogTitle>
        <DialogContent>
          {deleteError && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}
          {deleteSuccess && <Alert severity="success" sx={{ mb: 2 }}>Позиция успешно удалена!</Alert>}
          <Typography>Вы уверены, что хотите удалить эту позицию меню?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete} disabled={deleteLoading}>Отмена</Button>
          <Button onClick={handleDelete} variant="contained" color="error" disabled={deleteLoading}>
            {deleteLoading ? 'Удаляем...' : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
      <Stack spacing={2} sx={{ p: 3 }}>
        <Link color="inherit" underline="hover" variant="subtitle2" noWrap>
          {product.name}
        </Link>
        {product.description && (
          <Typography variant="body2" color="text.secondary" sx={{ minHeight: 36 }}>
            {product.description}
          </Typography>
        )}
        {product.ingredients && (
          <Typography variant="caption" color="text.disabled" sx={{ minHeight: 24 }}>
            Состав: {product.ingredients}
          </Typography>
        )}
        {renderVariants}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {selectedVariant && (
            <Typography variant="caption" color="text.secondary">
              {selectedVariant.portion.volume} {selectedVariant.portion.unit}
            </Typography>
          )}
          {renderPrice}
        </Box>
      </Stack>
    </Card>
  );
}
