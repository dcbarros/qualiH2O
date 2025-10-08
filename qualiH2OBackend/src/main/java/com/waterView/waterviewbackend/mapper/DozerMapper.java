package com.waterView.waterviewbackend.mapper;

import java.lang.reflect.Field;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;

import com.github.dozermapper.core.DozerBeanMapperBuilder;
import com.github.dozermapper.core.Mapper;
import com.github.dozermapper.core.Mapping;

public class DozerMapper {
    private static final Mapper mapper = DozerBeanMapperBuilder.buildDefault();


    public static <O, D> D parseObject(O origin, Class<D> destinationClass) {
        if (origin == null) return null;


        D dest = mapper.map(origin, destinationClass);

        BeanWrapper src = new BeanWrapperImpl(origin);
        BeanWrapper dst = new BeanWrapperImpl(dest);

        for (Field field : destinationClass.getDeclaredFields()) {
            Mapping m = field.getAnnotation(Mapping.class);
            if (m != null) {
                String path = m.value();
                Object val = src.getPropertyValue(path);
                dst.setPropertyValue(field.getName(), val);
            }
        }

        return dest;
    }

    public static <O, D> List<D> parseListObjects(List<O> originList, Class<D> destinationClass) {
        return originList.stream()
                .map(o -> parseObject(o, destinationClass))
                .collect(Collectors.toList());
    }
}
