import { useState, useCallback, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Alert from '@mui/material/Alert';
import axios from 'axios';
import { DashboardContent } from 'src/layouts/dashboard';
import { ProductItem } from '../product-item';
import { API_BASE_URL } from 'src/config-global';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { Iconify } from 'src/components/iconify';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';

// Типы для категорий и продуктов

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

type ProductType = {
  id: number | string;
  name: string;
  price: number | null;
  image?: string;
  is_active?: boolean;
  description?: string;
  ingredients?: string;
  volume?: string | null;
  variants?: VariantType[];
};

type CategoryType = {
  id: number | string;
  name: string;
  items: ProductType[];
};

export function ProductsView() {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Модалка создания позиции меню
  const [openCreate, setOpenCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newIngredients, setNewIngredients] = useState('');
  const [newVolume, setNewVolume] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newActive, setNewActive] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [newCategory, setNewCategory] = useState<number | null>(null);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [newVariants, setNewVariants] = useState<{portion_id: number; price: string; is_default: boolean}[]>([]);
  const [portions, setPortions] = useState<PortionType[]>([]);
  const [portionsLoading, setPortionsLoading] = useState(false);

  // Загрузка доступных порций при открытии модалки создания
  useEffect(() => {
    if (openCreate) {
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
        })
        .catch(() => {
          setPortionsLoading(false);
        });
    }
  }, [openCreate]);

  const handleOpenCreate = () => {
    setOpenCreate(true);
    setNewName('');
    setNewDescription('');
    setNewIngredients('');
    setNewVolume('');
    setNewPrice('');
    setNewActive(true);
    setNewCategory(selectedCategory);
    setNewImage(null);
    setNewVariants([]);
    setCreateError(null);
    setCreateSuccess(false);
  };
  const handleCloseCreate = () => {
    setOpenCreate(false);
    setCreateError(null);
    setCreateSuccess(false);
  };

  const handleAddVariant = () => {
    if (portions.length > 0) {
      const newVariant = {
        portion_id: portions[0].id,
        price: '',
        is_default: newVariants.length === 0 // первый вариант по умолчанию дефолтный
      };
      setNewVariants([...newVariants, newVariant]);
    }
  };

  const handleRemoveVariant = (index: number) => {
    const updatedVariants = [...newVariants];
    updatedVariants.splice(index, 1);
    
    // Если удалили дефолтный вариант, делаем первый вариант дефолтным
    if (updatedVariants.length > 0 && !updatedVariants.some(v => v.is_default)) {
      updatedVariants[0].is_default = true;
    }
    
    setNewVariants(updatedVariants);
  };

  const handleUpdateVariant = (index: number, field: string, value: any) => {
    const updatedVariants = [...newVariants];
    
    // Если меняем is_default на true, сбрасываем у всех остальных
    if (field === 'is_default' && value === true) {
      updatedVariants.forEach((v, i) => {
        if (i !== index) {
          v.is_default = false;
        }
      });
    }
    
    updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    setNewVariants(updatedVariants);
  };

  const handleCreate = () => {
    setCreateLoading(true);
    setCreateError(null);
    setCreateSuccess(false);
    const token = localStorage.getItem('authToken');
    
    // Используем FormData для изображения или JSON для данных в зависимости от наличия изображения
    if (newImage) {
      const formData = new FormData();
      formData.append('category_id', String(newCategory));
      formData.append('name', newName);
      formData.append('description', newDescription);
      formData.append('ingredients', newIngredients);
      formData.append('is_active', String(newActive));
      formData.append('image', newImage);
      
      // Добавляем варианты как JSON строку
      if (newVariants.length > 0) {
        formData.append('variants', JSON.stringify(newVariants));
      } else if (newVolume && newPrice) {
        // Если нет вариантов, но есть объем и цена - используем их
        formData.append('volume', newVolume);
        formData.append('price', newPrice);
      }
      
      axios.post(`${API_BASE_URL}/api/menu-items/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Token ${token}`,
        },
      })
        .then(() => {
          setCreateSuccess(true);
          setCreateLoading(false);
          setTimeout(() => {
            setOpenCreate(false);
            reloadMenu();
          }, 1000);
        })
        .catch(err => {
          setCreateError(err?.response?.data?.detail || 'Ошибка создания позиции');
          setCreateLoading(false);
        });
    } else {
      // Без изображения используем JSON
      const data: any = {
        category_id: newCategory,
        name: newName,
        description: newDescription,
        ingredients: newIngredients,
        is_active: newActive
      };
      
      if (newVariants.length > 0) {
        data.variants = newVariants;
      } else if (newVolume && newPrice) {
        data.volume = newVolume;
        data.price = newPrice;
      }
      
      axios.post(`${API_BASE_URL}/api/menu-items/`, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
      })
        .then(() => {
          setCreateSuccess(true);
          setCreateLoading(false);
          setTimeout(() => {
            setOpenCreate(false);
            reloadMenu();
          }, 1000);
        })
        .catch(err => {
          setCreateError(err?.response?.data?.detail || 'Ошибка создания позиции');
          setCreateLoading(false);
        });
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get(`${API_BASE_URL}/api/menu-tree/`)
      .then(res => {
        setCategories(Array.isArray(res.data) ? res.data : []);
        setSelectedCategory(Array.isArray(res.data) && res.data.length > 0 ? res.data[0].id : null);
        setLoading(false);
      })
      .catch(() => {
        setError('Ошибка загрузки товаров');
        setLoading(false);
      });
  }, []);

  const handleCategoryChange = (_: any, newValue: number) => {
    setSelectedCategory(newValue);
  };

  const currentCategory = categories.find((cat) => cat.id === selectedCategory);
  const products = currentCategory?.items || [];

  // Функция для обновления данных после изменений
  const reloadMenu = () => {
    setLoading(true);
    setError(null);
    axios.get<CategoryType[]>(`${API_BASE_URL}/api/menu-tree/`)
      .then(res => {
        setCategories(Array.isArray(res.data) ? res.data : []);
        setSelectedCategory((prev) => {
          // если категория осталась, не сбрасываем
          if (prev && res.data.find((cat) => Number(cat.id) === prev)) return prev;
          return Array.isArray(res.data) && res.data.length > 0 ? Number(res.data[0].id) : null;
        });
        setLoading(false);
      })
      .catch(() => {
        setError('Ошибка загрузки товаров');
        setLoading(false);
      });
  };

  // Получаем цену и объем из вариантов, выбирая дефолтный или первый
  const getDefaultVariantInfo = (product: ProductType) => {
    if (!product.variants || product.variants.length === 0) {
      return {
        price: product.price,
        volume: product.volume ?? ''
      };
    }

    const defaultVariant = product.variants.find(v => v.is_default) || product.variants[0];
    const volume = defaultVariant.portion.volume 
      ? `${defaultVariant.portion.volume} ${defaultVariant.portion.unit}` 
      : (product.volume ?? '');
    
    return {
      price: parseFloat(defaultVariant.price),
      volume: volume
    };
  };

  return (
    <DashboardContent >
      <Box
        sx={{
          mb: 5,
          display: 'flex',
          alignItems: 'center',
        }}
      >
          <Typography variant="h4" sx={{ flexGrow: 1 }}>
            Меню
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Button
              variant="contained"
              color="inherit"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={handleOpenCreate}
            >
              Новая позиция меню
            </Button>
          </Box>
      </Box>
     
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      <Dialog open={openCreate} onClose={handleCloseCreate} maxWidth="md" fullWidth>
        <DialogTitle>Новая позиция меню</DialogTitle>
        <DialogContent>
          {createError && <Alert severity="error" sx={{ mb: 2 }}>{createError}</Alert>}
          {createSuccess && <Alert severity="success" sx={{ mb: 2 }}>Позиция успешно создана!</Alert>}
          <InputLabel id="category-label">Категория</InputLabel>
          <Select
            labelId="category-label"
            value={newCategory ?? ''}
            onChange={e => setNewCategory(Number(e.target.value))}
            fullWidth
            sx={{ mb: 2 }}
            disabled={createLoading}
          >
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
            ))}
          </Select>
          <TextField
            fullWidth
            label="Название"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
            disabled={createLoading}
          />
          <TextField
            fullWidth
            label="Описание"
            value={newDescription}
            onChange={e => setNewDescription(e.target.value)}
            sx={{ mb: 2 }}
            disabled={createLoading}
          />
          <TextField
            fullWidth
            label="Ингредиенты"
            value={newIngredients}
            onChange={e => setNewIngredients(e.target.value)}
            sx={{ mb: 2 }}
            disabled={createLoading}
          />
          
          <Typography variant="subtitle1" sx={{ mb: 2 }}>Варианты порций</Typography>
          
          {newVariants.length === 0 ? (
            <>
              <TextField
                fullWidth
                label="Объем"
                value={newVolume}
                onChange={e => setNewVolume(e.target.value)}
                sx={{ mb: 2 }}
                disabled={createLoading}
              />
              <TextField
                fullWidth
                label="Цена (сом)"
                value={newPrice}
                onChange={e => setNewPrice(e.target.value)}
                sx={{ mb: 2 }}
                type="number"
                disabled={createLoading}
              />
            </>
          ) : (
            <Box sx={{ mb: 2 }}>
              {newVariants.map((variant, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                  <Select
                    value={variant.portion_id}
                    onChange={e => handleUpdateVariant(index, 'portion_id', Number(e.target.value))}
                    size="small"
                    disabled={createLoading || portionsLoading}
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
                    disabled={createLoading}
                    sx={{ flex: 1 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={variant.is_default}
                        onChange={e => handleUpdateVariant(index, 'is_default', e.target.checked)}
                        disabled={createLoading}
                        size="small"
                      />
                    }
                    label="По умолчанию"
                    sx={{ flex: 1 }}
                  />
                  <IconButton 
                    onClick={() => handleRemoveVariant(index)}
                    disabled={createLoading}
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
            disabled={createLoading || portionsLoading}
          >
            Добавить вариант
          </Button>
          
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ mb: 2 }}
            disabled={createLoading}
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
          <FormControlLabel
            control={<Switch checked={newActive} onChange={e => setNewActive(e.target.checked)} disabled={createLoading} />}
            label="Активна"
            sx={{ mb: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreate} disabled={createLoading}>Отмена</Button>
          <Button 
            onClick={handleCreate} 
            variant="contained" 
            color="primary" 
            disabled={createLoading || !newName || !newCategory || (newVariants.length === 0 && !newPrice)}
          >
            {createLoading ? 'Создание...' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {loading ? (
        <Box sx={{ p: 5, textAlign: 'center' }}>
          <Typography>Загрузка...</Typography>
        </Box>
      ) : (
        <>
          <Tabs
            value={selectedCategory}
            onChange={handleCategoryChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 4 }}
          >
            {categories.map((cat) => (
              <Tab key={cat.id} value={cat.id} label={cat.name} />
            ))}
          </Tabs>

          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              md: '1fr 1fr 1fr',
              lg: '1fr 1fr 1fr 1fr 1fr',
            },
            gap: 3,
          }}>
            {products.length === 0 ? (
              <Box sx={{ width: '100%' }}>
                <Typography align="center" color="text.secondary">
                  Нет товаров в этой категории
                </Typography>
              </Box>
            ) : (
              products.map((product: ProductType) => {
                const variantInfo = getDefaultVariantInfo(product);
                
                return (
                  <Box key={product.id} sx={{ minWidth: 180, maxWidth: 300, width: '100%' }}>
                    <ProductItem product={{
                      id: String(product.id),
                      name: product.name,
                      price: variantInfo.price || 0,
                      coverUrl: product.image || '',
                      status: product.is_active ? '' : 'inactive',
                      colors: [],
                      priceSale: null,
                      description: product.description,
                      ingredients: product.ingredients,
                      volume: variantInfo.volume,
                      variants: product.variants,
                    }} showSkeleton={!product.image} onChange={reloadMenu} />
                  </Box>
                );
              })
            )}
          </Box>
        </>
      )}
    </DashboardContent>
  );
}
