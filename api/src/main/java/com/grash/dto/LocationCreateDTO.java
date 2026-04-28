package com.grash.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class LocationCreateDTO extends LocationPatchDTO {

    @Override
    @NotBlank
    public String getName() {
        return super.getName();
    }
}
